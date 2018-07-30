using System;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class ProjectRepository : DefaultEntityRepository<Project>
    {
        public IOrganizationContext OrganizationContext { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public UserRepository UserRepository { get; set; }

        public ProjectRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext,
            UserRepository userRepository,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.OrganizationContext = organizationContext;
            this.CurrentUserContext = currentUserContext;
            this.UserRepository = userRepository;
        }

        public override IQueryable<Project> Get()
        {
            if (OrganizationContext.SpecifiedOrganizationDoesNotExist) return Enumerable.Empty<Project>().AsQueryable();
            if (!OrganizationContext.HasOrganization)
            {
                // No organization specified, so include all projects in the all the organizations that the current user is a member
                var currentUser = UserRepository.GetByAuth0Id(CurrentUserContext.Auth0Id).Result;
                return base.Get()
                           .Where(p => currentUser.OrganizationIds.Contains(p.OrganizationId));
            }
            // Get users in the current organization
            return base.Get()
                       .Where(p => p.OrganizationId == OrganizationContext.OrganizationId);
        }

        public override async Task<Project> UpdateAsync(int id, Project entity)
        {
            ValidateOrganization(entity);
            return await base.UpdateAsync(id, entity);
        }

        public override async Task<Project> CreateAsync(Project entity)
        {
            ValidateOrganization(entity);
            return await base.CreateAsync(entity);
        }

        private void ValidateOrganization(Project project)
        {
            //
            // TODO: Needs testing
            //
            if (project.Organization != project.Group.Owner)
            {
                var message = $"Project '{project.Name}': Group '{project.Group.Name}' not owned by project organization '{project.Organization.Name}'";
                Log.Error(message);
                throw new Exception(message);
            }

            if (!project.Owner.OrganizationIds.Contains(project.OrganizationId))
            {
                var message = $"Project '{project.Name}': Owner '{project.Owner.Name}' not a member of project organization '{project.Organization.Name}'";
                Log.Error(message);
                throw new Exception(message);

            }
        }
    }
}
