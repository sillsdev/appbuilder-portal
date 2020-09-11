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
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineProjectService : BuildEngineServiceBase, IBuildEngineProjectService
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
        public async Task<TokenResponse> GetProjectTokenAsync(int projectId)
        {
            var project = await ProjectRepository.Get()
                .Where(p => p.Id == projectId)
                .Include(p => p.Organization)
                .Include(p => p.Owner)
                .Include(p => p.Group)
                .Include(p => p.Type)
                .FirstOrDefaultAsync();
            if (!(project == null || project.Owner == null))
            {
                if (SetBuildEngineEndpoint(project.Organization))
                {
                    var name = project.Owner.ExternalId;
                    var tokenRequest = new TokenRequest
                    {
                        Name = name
                    };
                    var tokenResponse = BuildEngineApi.GetProjectAccessToken(project.WorkflowProjectId, tokenRequest);
                    return tokenResponse;
                }
            }
            return null;
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
                return;
            }
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

        protected async Task CreateBuildEngineProjectAsync(Project project, PerformContext context)
        {
            var buildEngineProject = new BuildEngineProject
            {
                AppId = project.Type.Name,
                LanguageCode = project.Language,
                ProjectName = project.Name,
                StorageType = "s3"
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
                if (projectResponse.Status == "completed")
                {
                    if (projectResponse.Result == "SUCCESS")
                    {
                        await ProjectCompletedAsync(project, projectResponse);
                    }
                    else
                    {
                        await ProjectCreationFailedAsync(project, projectResponse);
                    }
                    return;
                }
            }
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
        protected async Task ProjectCompletedAsync(Project project, ProjectResponse projectResponse)
        {
            project.WorkflowProjectUrl = projectResponse.Url;

            // Assign at the same time as WorkflowProjectUrl now that it is available.
            project.WorkflowAppProjectUrl = GetVarOrDefault("UI_URL", "http://localhost:9091") + "/projects/" + project.Id;

            await ProjectRepository.UpdateAsync(project);
            var messageParms = new Dictionary<string, object>()
            {
                { "projectName", project.Name }
            };
            await SendNotificationSvc.SendNotificationToUserAsync(project.Owner, "projectCreatedSuccessfully", messageParms);
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
        }
    }
}
