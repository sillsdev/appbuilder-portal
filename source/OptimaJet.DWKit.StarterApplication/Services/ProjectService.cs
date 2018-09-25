using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Forms.Projects;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using static OptimaJet.DWKit.StarterApplication.Utility.ServiceExtensions;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class ProjectService : EntityResourceService<Project>
    {
        public IOrganizationContext OrganizationContext { get; private set; }
        public IJsonApiContext JsonApiContext { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public UserRepository UserRepository { get; }
        public GroupRepository GroupRepository { get; }
        public ProjectRepository ProjectRepository { get; }
        public CurrentUserRepository CurrentUserRepository { get; }
        public IEntityRepository<Organization> OrganizationRepository { get; set; }

        public ProjectService(
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext,
            UserRepository userRepository,
            IEntityRepository<Project> projectRepository,
            CurrentUserRepository currentUserRepository,
            GroupRepository groupRepository,
            IEntityRepository<Organization> organizationRepository,
            ILoggerFactory loggerFactory) : base(jsonApiContext, projectRepository, loggerFactory)
        {
            OrganizationContext = organizationContext;
            JsonApiContext = jsonApiContext;
            CurrentUserContext = currentUserContext;
            UserRepository = userRepository;
            GroupRepository = groupRepository;
            OrganizationRepository = organizationRepository;
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
                                           OrganizationContext,
                                           ProjectRepository);
            if (!updateForm.IsValid(id, resource))
            {
                throw new JsonApiException(updateForm.Errors);
            }
             return await base.UpdateAsync(id, resource);
        }
        public override async Task<Project> CreateAsync(Project resource)
        {
            var createForm = new CreateForm(UserRepository,
                                           GroupRepository,
                                           CurrentUserContext,
                                           OrganizationRepository);
            if (!createForm.IsValid(resource))
            {
                throw new JsonApiException(createForm.Errors);
            }
            return await base.CreateAsync(resource);
        }
    }

}
