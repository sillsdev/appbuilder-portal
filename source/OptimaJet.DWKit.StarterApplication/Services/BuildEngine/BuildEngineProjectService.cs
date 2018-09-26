using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.BuildEngineApiClient;
using Project = OptimaJet.DWKit.StarterApplication.Models.Project;
using BuildEngineProject = SIL.AppBuilder.BuildEngineApiClient.Project;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineProjectService
    {
        protected IEntityRepository<Project> ProjectRepository;

        protected IEntityRepository<SystemStatus> SystemStatusRepository { get; }

        public BuildEngineProjectService(
            IEntityRepository<Project> projectRepository,
            IEntityRepository<SystemStatus>systemStatusRepository
        )
        {
            ProjectRepository = projectRepository;
            SystemStatusRepository = systemStatusRepository;
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
                return;
                throw new Exception("Project record not found");
            }
            if (!ProjectLinkAvailable(project))
            {
                // If the build engine isn't available, there is no point in continuing
                // Notifications for this are handled by the monitor
                return;
                throw new Exception("Connection not available");
            }
            if (project.WorkflowProjectId == 0)
            {
                // WorkflowProjectId not set
                // Need to issue create project to build engine
                CreateBuildEngineProject(project);
                return;
            }
            else 
            {
                CheckExistingProject(project);
                return;
            }
        }

        protected void CreateBuildEngineProject(Project project)
        {
            var buildEngineProject = new BuildEngineProject
            {
                UserId = project.Owner.Email,
                GroupId = project.Group.Abbreviation,
                AppId = project.Type.Name,
                LanguageCode = project.Language,
                PublishingKey = project.Owner.PublishingKey
            };

        }
        protected void CheckExistingProject(Project project)
        {
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
                return false;
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

        }
        protected void ProjectCreationFailed(Project project, ProjectResponse projectResponse)
        {

        }
        protected void CreationInProgress(Project project, ProjectResponse projectResponse)
        {

        }
    }
}