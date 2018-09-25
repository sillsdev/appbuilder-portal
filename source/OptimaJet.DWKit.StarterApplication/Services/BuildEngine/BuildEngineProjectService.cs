using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.BuildEngineApiClient;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineProjectService
    {
        IEntityRepository<Models.Project> ProjectRepository;
        public BuildEngineProjectService(
            IEntityRepository<Models.Project> projectRepository
        )
        {
            ProjectRepository = projectRepository;
        }
        public void ManageProject(int projectId)
        {
            var project = ProjectRepository.Get()
                .Where(p => p.Id == projectId)
                .Include(pr => pr.Organization)
                .FirstOrDefaultAsync().Result;
            if (project == null)
            {
                // Can't find the project record whose creation should have
                // triggered this process
                // TODO: Send notification record
                return;
            }
            if (!ProjectLinkAvailable(project))
            {
                // If the build engine isn't available, there is no point in continuing
                // Notifications for this are handled by the monitor
                return;
            }
            if (project.WorkflowProjectId == 0)
            {
                // WorkflowProjectId not set
                // Need to issue create project to build engine
                CreateBuildEngineProject(project);
                return;
            } else 
            {
                var buildEngineProject = GetBuildEngineProject(project);
            }
        }
        protected void CreateBuildEngineProject(Models.Project project)
        {

        }
        protected bool ProjectLinkAvailable(Models.Project project)
        {
            return true;
        }
        protected SIL.AppBuilder.BuildEngineApiClient.Project GetBuildEngineProject(Models.Project project)
        {
            return null;
        }
    }
}