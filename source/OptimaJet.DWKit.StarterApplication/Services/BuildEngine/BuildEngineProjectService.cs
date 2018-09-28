using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.BuildEngineApiClient;
using Project = OptimaJet.DWKit.StarterApplication.Models.Project;
using BuildEngineProject = SIL.AppBuilder.BuildEngineApiClient.Project;
using Hangfire;
using Hangfire.Common;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineProjectService
    {
        protected IEntityRepository<Project> ProjectRepository;

        public IRecurringJobManager RecurringJobManager { get; }
        public IBuildEngineApi BuildEngineApi { get; }
        protected IEntityRepository<SystemStatus> SystemStatusRepository { get; }

        public BuildEngineProjectService(
            IRecurringJobManager recurringJobManager,
            IBuildEngineApi buildEngineApi,
            IEntityRepository<Project> projectRepository,
            IEntityRepository<SystemStatus> systemStatusRepository
        )
        {
            RecurringJobManager = recurringJobManager;
            BuildEngineApi = buildEngineApi;
            ProjectRepository = projectRepository;
            SystemStatusRepository = systemStatusRepository;
        }
        public void ManageProject(int projectId)
        {
            // Hangfire methods cannot be async, hence the Wait
            ManageProjectAsync(projectId).Wait();
        }
        public async System.Threading.Tasks.Task ManageProjectAsync(int projectId)
        {
            var project = ProjectRepository.Get()
                .Where(p => p.Id == projectId)
                .Include(p => p.Organization)
                .Include(p => p.Owner)
                .Include(p => p.Group)
                .Include(p => p.Type)
                .FirstOrDefaultAsync().Result;
            if (project == null)
            {
                // Can't find the project record whose creation should have
                // triggered this process.  Exception will trigger retry
                // TODO: Send notification record
                // Don't send exception because there doesn't seem to be a point in retrying
                ClearAndExit(projectId);
            }
            if (!ProjectLinkAvailable(project))
            {
                // If the build engine isn't available, there is no point in continuing
                // Notifications for this are handled by the monitor
                throw new Exception("Connection not available");
            }
            if (project.WorkflowProjectId == 0)
            {
                // WorkflowProjectId not set
                // Need to issue create project to build engine
                await CreateBuildEngineProjectAsync(project);
                return;
            }
            else
            {
                CheckExistingProject(project);
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
                PublishingKey = project.Owner.PublishingKey
            };
            var organization = project.Organization;
            BuildEngineApi.SetEndpoint(organization.BuildEngineUrl, organization.BuildEngineApiAccessToken);
            var projectResponse = BuildEngineApi.CreateProject(buildEngineProject);
            if (projectResponse != null)
            {
                // Set state to active?
                project.WorkflowProjectId = projectResponse.Id;
                await ProjectRepository.UpdateAsync(project.Id, project);
                var monitorJob = Job.FromExpression<BuildEngineProjectService>(service => service.ManageProject(project.Id));
                RecurringJobManager.AddOrUpdate(GetHangfireToken(project.Id), monitorJob, "* * * * *");
            }
            else
            {
                // TODO: Send Notification
                throw new Exception("Create project failed");
            }
        }
        protected void CheckExistingProject(Project project)
        {
            ClearAndExit(project.Id);  // TODO: Remove when other methods are implemented
            var buildEngineProject = GetBuildEngineProject(project);
            if (buildEngineProject == null)
            {
                return;
            }
            if (buildEngineProject.Status == "completed")
            {
                if (buildEngineProject.Result == "SUCCESS")
                {
                    ProjectCompleted(project, buildEngineProject);
                }
                else
                {
                    ProjectCreationFailed(project, buildEngineProject);
                }
            }
            else
            {
                CreationInProgress(project, buildEngineProject);
            }
        }
        protected bool ProjectLinkAvailable(Project project)
        {
            var organization = project.Organization;
            var systemStatus = SystemStatusRepository.Get()
                 .Where(ss => (ss.BuildEngineApiAccessToken == organization.BuildEngineApiAccessToken)
                        && (ss.BuildEngineUrl == organization.BuildEngineUrl))
                 .FirstOrDefaultAsync().Result;
            if (systemStatus == null)
            {
                // TODO: Send Notification
                throw new Exception("SystemStatus record for connection not found");
            }

            return systemStatus.SystemAvailable;
        }
        protected ProjectResponse GetBuildEngineProject(Project project)
        {
            return null;
        }
        protected void ProjectCompleted(Project project, ProjectResponse projectResponse)
        {
            ClearAndExit(project.Id);
        }
        protected void ProjectCreationFailed(Project project, ProjectResponse projectResponse)
        {
            ClearAndExit(project.Id);
        }
        protected void CreationInProgress(Project project, ProjectResponse projectResponse)
        {

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
    }
}