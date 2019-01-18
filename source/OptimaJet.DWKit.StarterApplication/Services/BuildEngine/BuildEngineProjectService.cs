using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Server;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using SIL.AppBuilder.BuildEngineApiClient;
using BuildEngineProject = SIL.AppBuilder.BuildEngineApiClient.Project;
using Job = Hangfire.Common.Job;
using Project = OptimaJet.DWKit.StarterApplication.Models.Project;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineProjectService : BuildEngineServiceBase
    {
        protected IJobRepository<Project> ProjectRepository;

        public IRecurringJobManager RecurringJobManager { get; set; }
        public SendNotificationService SendNotificationSvc { get; }

        public BuildEngineProjectService(
            IRecurringJobManager recurringJobManager,
            IBuildEngineApi buildEngineApi,
            SendNotificationService sendNotificationService,
            IJobRepository<Project> projectRepository,
            IJobRepository<SystemStatus> systemStatusRepository
        ) : base(buildEngineApi, sendNotificationService, systemStatusRepository)
        {
            RecurringJobManager = recurringJobManager;
            SendNotificationSvc = sendNotificationService;
            ProjectRepository = projectRepository;
        }

        public void ManageProject(int projectId, PerformContext context)
        {
            // Hangfire methods cannot be async, hence the Wait
            ManageProjectAsync(projectId, context).Wait();
        }
        public void UpdateProject(int projectId, PerformContext context)
        {
            UpdateProjectAsync(projectId, context).Wait();
        }
        public async Task ManageProjectAsync(int projectId, PerformContext context)
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
                // Don't send exception because there doesn't seem to be a point in retrying
                var messageParms = new Dictionary<string, object>()
                {
                    { "projectId", projectId.ToString() }
                };
                await SendNotificationSvc.SendNotificationToSuperAdminsAsync("projectRecordNotFound",
                                                                               messageParms);
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
                    var messageParms = new Dictionary<string, object>()
                        {
                            { "orgName", project.Organization.Name },
                            { "projectName", project.Name }
                        };
                    await SendNotificationOnFinalRetryAsync(context, project.Organization, project.Owner, "projectFailedBuildEngine", messageParms);
                    throw new Exception("Connection not available");
                }
                await CreateBuildEngineProjectAsync(project, context);
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

        protected async Task CreateBuildEngineProjectAsync(Project project, PerformContext context)
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
            ProjectResponse projectResponse = null;
            if (SetBuildEngineEndpoint(project.Organization))
            {
                projectResponse = BuildEngineApi.CreateProject(buildEngineProject);
            }
            if ((projectResponse != null) && (projectResponse.Id != 0))
            {
                // Set state to active?
                project.WorkflowProjectId = projectResponse.Id;
                await ProjectRepository.UpdateAsync(project);
                var monitorJob = Job.FromExpression<BuildEngineProjectService>(service => service.ManageProject(project.Id, null));
                RecurringJobManager.AddOrUpdate(GetHangfireToken(project.Id), monitorJob, "* * * * *");
            }
            else
            {
                if (IsFinalRetry(context))
                {
                    var messageParms = new Dictionary<string, object>()
                    {
                        { "projectName", project.Name }
                    };
                    await SendNotificationSvc.SendNotificationToOrgAdminsAndOwnerAsync(project.Organization, project.Owner,
                                                                                   "projectFailedUnableToCreate",
                                                                                   messageParms);
                }
                // Throw Exception to force retry
                throw new Exception("Create project failed");
            }
        }
        protected async Task CheckExistingProjectAsync(Project project)
        {
            var buildEngineProject = GetBuildEngineProject(project);
            if ((buildEngineProject == null) || (buildEngineProject.Id == 0))
            {
                // Attempt to get project failed, retry in one minute
                // This is normal since it will take some time for the build engine
                // to actually create the project
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
                    await ProjectCreationFailedAsync(project, buildEngineProject);
                }
            }
            return;
        }
        /// <summary>
        /// Retrieve the project information from the build engine.
        /// </summary>
        /// <returns> The project information from the build engine or null if 
        ///           unable to connect to the build engine. </returns>
        /// <param name="project">Project record from the database </param>
        protected ProjectResponse GetBuildEngineProject(Project project)
        {
            if (!SetBuildEngineEndpoint(project.Organization))
            {
                return null;
            }
            var projectResponse = BuildEngineApi.GetProject(project.WorkflowProjectId);
            return projectResponse;
        }
        protected async Task ProjectCompletedAsync(Project project, ProjectResponse projectResponse)
        {
            project.WorkflowProjectUrl = projectResponse.Url;
            await ProjectRepository.UpdateAsync(project);
            var messageParms = new Dictionary<string, object>()
            {
                { "projectName", project.Name }
            };
            await SendNotificationSvc.SendNotificationToUserAsync(project.Owner, "projectCreatedSuccessfully", messageParms);
            ClearAndExit(project.Id);
        }
        protected async Task ProjectCreationFailedAsync(Project project, ProjectResponse projectResponse)
        {
            var buildEngineUrl = project.Organization.BuildEngineUrl + "/project-admin/view?id=" + project.WorkflowProjectId.ToString();
            var messageParms = new Dictionary<string, object>()
            {
                { "projectName", project.Name },
                { "projectStatus", projectResponse.Status },
                { "projectError", projectResponse.Error },
                { "buildEngineUrl", buildEngineUrl }
            };
            await SendNotificationSvc.SendNotificationToOrgAdminsAndOwnerAsync(project.Organization, project.Owner, "projectCreationFailedOwner", "projectCreationFailedAdmin", messageParms, buildEngineUrl);
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
        public async Task<BuildEngineStatus> GetStatusAsync(int projectId)
        {
            var project = await ProjectRepository.Get()
                .Where(p => p.Id == projectId)
                .Include(p => p.Organization)
                .FirstOrDefaultAsync();
            if (project == null)
            {
                return BuildEngineStatus.Unavailable;
            }
            if (!BuildEngineLinkAvailable(project.Organization))
            {
                return BuildEngineStatus.Unavailable;
            }
            var buildEngineProject = GetBuildEngineProject(project);
            if ((buildEngineProject == null) || (buildEngineProject.Id == 0))
            {
                return BuildEngineStatus.Unavailable;
            }
            switch (buildEngineProject.Status)
            {
                case "initialized":
                case "active":
                    return BuildEngineStatus.InProgress;
                case "completed":
                    return (buildEngineProject.Result == "SUCCESS") ? BuildEngineStatus.Success : BuildEngineStatus.Failure;
                default:
                    return BuildEngineStatus.Unavailable;
            }
        }
        public async Task UpdateProjectAsync(int projectId, PerformContext context)
        {
            var project = await ProjectRepository.Get()
                .Where(p => p.Id == projectId)
                .Include(p => p.Organization)
                .Include(p => p.Owner)
                .FirstOrDefaultAsync();
            if (project == null)
            {
                // Can't find the project record whose creation should have
                // triggered this process.  Exception will trigger retry
                // Don't send exception because there doesn't seem to be a point in retrying
                var messageParms = new Dictionary<string, object>()
                {
                    { "projectId", projectId.ToString() }
                };
                await SendNotificationSvc.SendNotificationToSuperAdminsAsync("projectRecordNotFound",
                                                                               messageParms);
                ClearAndExit(projectId);
                return;
            }
            var buildEngineProject = new BuildEngineProject
            {
                UserId = project.Owner.Email,
                PublishingKey = project.Owner.PublishingKey,
            };
            if (!BuildEngineLinkAvailable(project.Organization))
            {
                if (IsFinalRetry(context))
                {
                    var messageParms = new Dictionary<string, object>()
                    {
                        { "projectName", project.Name }
                    };
                    await SendNotificationSvc.SendNotificationToOrgAdminsAndOwnerAsync(project.Organization, project.Owner,
                                                                                   "projectUpdateFailedBuildEngine",
                                                                                   messageParms);
                }
                // Throw Exception to force retry
                throw new Exception("Connection not available");
            }

            if (SetBuildEngineEndpoint(project.Organization))
            {
                var projectResponse = BuildEngineApi.UpdateProject(project.WorkflowProjectId, buildEngineProject);
                if (projectResponse.Status == "completed" && projectResponse.Result == "SUCCESS")
                {
                    var messageParms = new Dictionary<string, object>()
                    {
                        {"projectName", project.Name}
                    };
                    await SendNotificationSvc.SendNotificationToUserAsync(project.Owner, "projectUpdateComplete",
                                                                                   messageParms);
                }
                else
                {
                    var messageParms = new Dictionary<string, object>()
                    {
                        {"projectName", project.Name},
                        {"buildEngineProjectId", project.WorkflowProjectId.ToString()},
                        {"status", projectResponse.Status ?? "null"},
                        {"result", projectResponse.Result ?? "null"}
                    };
                    await SendNotificationSvc.SendNotificationToOrgAdminsAndOwnerAsync(project.Organization, project.Owner, "projectUpdateFailed",
                                                                                   messageParms);

                }
            }
        }
    }
}
