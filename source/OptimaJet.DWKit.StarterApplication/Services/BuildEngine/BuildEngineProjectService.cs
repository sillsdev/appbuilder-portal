using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.BuildEngineApiClient;
using Project = OptimaJet.DWKit.StarterApplication.Models.Project;
using BuildEngineProject = SIL.AppBuilder.BuildEngineApiClient.Project;
using Hangfire;
using Job = Hangfire.Common.Job;
using OptimaJet.DWKit.StarterApplication.Repositories;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineProjectService: BuildEngineServiceBase
    {
        protected IJobRepository<Project> ProjectRepository;

        public IRecurringJobManager RecurringJobManager { get; set; }

        public BuildEngineProjectService(
            IRecurringJobManager recurringJobManager,
            IBuildEngineApi buildEngineApi,
            IJobRepository<Project> projectRepository,
            IJobRepository<SystemStatus> systemStatusRepository
        ) : base(buildEngineApi, systemStatusRepository)
        {
            RecurringJobManager = recurringJobManager;
            ProjectRepository = projectRepository;
        }
        public void ManageProject(int projectId)
        {
            // Hangfire methods cannot be async, hence the Wait
            ManageProjectAsync(projectId).Wait();
        }
        public async System.Threading.Tasks.Task ManageProjectAsync(int projectId)
        {
            var project = await ProjectRepository.Get()
                .Where(p => p.Id == projectId)
                .Include(p => p.Organization)
                .Include(p => p.Owner)
                .Include(p => p.Group)
                .Include(p => p.Type)
                .FirstOrDefaultAsync();
            if (project == null)
            {
                // Can't find the project record whose creation should have
                // triggered this process.  Exception will trigger retry
                // TODO: Send notification record
                // Don't send exception because there doesn't seem to be a point in retrying
                ClearAndExit(projectId);
                return;
            }
            if (!BuildEngineProjectCreated(project))
            {
                if (!BuildEngineLinkAvailable(project.Organization))
                {
                    // If the build engine isn't available, there is no point in continuing
                    // Notifications for this are handled by the monitor
                    // Throw exception to retry
                    throw new Exception("Connection not available");
                }
                await CreateBuildEngineProjectAsync(project);
                return;
            }
            else
            {
                // Since this is a recurring task, there is no need to throw an exception
                // if the link is unavailable.  It will retry 
                if (BuildEngineLinkAvailable(project.Organization))
                {
                    await CheckExistingProjectAsync(project);
                }
                return;
            }
        }

        protected async System.Threading.Tasks.Task CreateBuildEngineProjectAsync(Project project)
        {
            var buildEngineProject = new BuildEngineProject
            {
                UserId = project.Owner.Email,
                GroupId = project.Group.Abbreviation,
                AppId = project.Type.Name,
                LanguageCode = project.Language,
                PublishingKey = project.Owner.PublishingKey,
                ProjectName = project.Name
            };
            SetBuildEngineEndpoint(project.Organization);
            var projectResponse = BuildEngineApi.CreateProject(buildEngineProject);
            if ((projectResponse != null) && (projectResponse.Id != 0))
            {
                // Set state to active?
                project.WorkflowProjectId = projectResponse.Id;
                await ProjectRepository.UpdateAsync(project);
                var monitorJob = Job.FromExpression<BuildEngineProjectService>(service => service.ManageProject(project.Id));
                RecurringJobManager.AddOrUpdate(GetHangfireToken(project.Id), monitorJob, "* * * * *");
            }
            else
            {
                // TODO: Send Notification
                // Throw Exception to force retry
                throw new Exception("Create project failed");
            }
        }
        protected async System.Threading.Tasks.Task CheckExistingProjectAsync(Project project)
        {
            var buildEngineProject = GetBuildEngineProject(project);
            if ((buildEngineProject == null) || (buildEngineProject.Id == 0))
            {
                // Attempt to get project failed, retry in one minute
                return;
            }
            if (buildEngineProject.Status == "completed")
            {
                if (buildEngineProject.Result == "SUCCESS")
                {
                    await ProjectCompletedAsync(project, buildEngineProject);
                }
                else
                {
                    ProjectCreationFailed(project, buildEngineProject);
                }
            }
            return;
        }
        protected ProjectResponse GetBuildEngineProject(Project project)
        {
            SetBuildEngineEndpoint(project.Organization);
            var projectResponse = BuildEngineApi.GetProject(project.WorkflowProjectId);
            return projectResponse;
        }
        protected async System.Threading.Tasks.Task ProjectCompletedAsync(Project project, ProjectResponse projectResponse)
        {
            project.WorkflowProjectUrl = projectResponse.Url;
            await ProjectRepository.UpdateAsync(project);
            ClearAndExit(project.Id);
        }
        protected void ProjectCreationFailed(Project project, ProjectResponse projectResponse)
        {
            ClearAndExit(project.Id);
        }
        // This method will kill the current recurring job if it exists
        // and return normally so no retry is attempted.
        protected void ClearAndExit(int projectId)
        {
            var jobToken = GetHangfireToken(projectId);
            RecurringJobManager.RemoveIfExists(jobToken);
            return;
        }
        protected String GetHangfireToken(int projectId)
        {
            return "CreateProjectMonitor" + projectId.ToString();
        }
        protected bool BuildEngineProjectCreated(Project project)
        {
            return (project.WorkflowProjectId != 0);
        }
    }
}