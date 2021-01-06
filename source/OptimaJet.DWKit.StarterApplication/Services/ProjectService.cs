using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Forms.Projects;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using OptimaJet.DWKit.StarterApplication.Services.Workflow;
using static OptimaJet.DWKit.StarterApplication.Utility.ServiceExtensions;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class ProjectService : EntityResourceService<Project>
    {
        public IOrganizationContext OrganizationContext { get; private set; }
        public IBackgroundJobClient HangfireClient { get; }
        public IJsonApiContext JsonApiContext { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public UserRepository UserRepository { get; }
        public GroupRepository GroupRepository { get; }
        public ProjectRepository ProjectRepository { get; }
        public CurrentUserRepository CurrentUserRepository { get; }
        public IEntityRepository<Organization> OrganizationRepository { get; set; }
        public IEntityRepository<UserRole> UserRolesRepository { get; }

        public ProjectService(
            IBackgroundJobClient hangfireClient,
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext,
            UserRepository userRepository,
            IEntityRepository<Project> projectRepository,
            CurrentUserRepository currentUserRepository,
            GroupRepository groupRepository,
            IEntityRepository<Organization> organizationRepository,
            IEntityRepository<UserRole> userRolesRepository,
            ILoggerFactory loggerFactory) : base(jsonApiContext, projectRepository, loggerFactory)
        {
            OrganizationContext = organizationContext;
            HangfireClient = hangfireClient;
            JsonApiContext = jsonApiContext;
            CurrentUserContext = currentUserContext;
            UserRepository = userRepository;
            GroupRepository = groupRepository;
            OrganizationRepository = organizationRepository;
            UserRolesRepository = userRolesRepository;
            ProjectRepository = (ProjectRepository)projectRepository;
            CurrentUserRepository = currentUserRepository;
        }
        public override async Task<IEnumerable<Project>> GetAsync()
        {
            if (OrganizationContext.IsOrganizationHeaderPresent) 
            {
                return await GetScopedToOrganization<Project>(
                    base.GetAsync,
                    OrganizationContext,
                    JsonApiContext);
            }

            return await base.GetAsync();
        }

        public override async Task<Project> GetAsync(int id)
        {
            var projects = await GetAsync();

            return projects.SingleOrDefault(g => g.Id == id);
        }

        public override async Task<Project> UpdateAsync(int id, Project resource)
        {
            //If changing organization, validate the change
            var updateForm = new UpdateForm(UserRepository,
                                           GroupRepository,
                                           CurrentUserContext,
                                           OrganizationRepository,
                                           UserRolesRepository,
                                           OrganizationContext,
                                           ProjectRepository);
            if (!updateForm.IsValid(id, resource))
            {
                throw new JsonApiException(updateForm.Errors);
            }

            var project = await base.UpdateAsync(id, resource);
            // If the owner is changing, call the build engine to update the project iam permissions
            if (resource.OwnerId != 0)
            {
                HangfireClient.Enqueue<WorkflowProjectService>(service => service.ReassignUserTasks(project.Id));
            }
            return project;
        }

        public override async Task<Project> CreateAsync(Project resource)
        {
            var createForm = new CreateForm(UserRepository,
                                           GroupRepository,
                                           CurrentUserContext,
                                           UserRolesRepository,
                                           OrganizationRepository);
            if (!createForm.IsValid(resource))
            {
                throw new JsonApiException(createForm.Errors);
            }
            var project = await base.CreateAsync(resource);

            if (project != null)
            {
                HangfireClient.Enqueue<BuildEngineProjectService>(service => service.ManageProject(project.Id, null));
            }
            return project;
        }

        public async Task<List<UserRole>> GetUserRolesForProject(Project project, int userId)
        {
            List<UserRole> roles = await UserRolesRepository.Get()
                .Where(ur => ur.OrganizationId == project.OrganizationId)
                .Where(ur => ur.UserId == userId)
                .ToListAsync();
            return roles;
        }
    }

}
