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
    public class ProjectRepository : ControllerRepository<Project>
    {
        public IOrganizationContext OrganizationContext { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public UserRepository UserRepository { get; set; }
        public GroupRepository GroupRepository { get; set; }
        public IEntityRepository<Organization> OrganizationRepository { get; set; }

        public ProjectRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext,
            UserRepository userRepository,
            GroupRepository groupRepository,
            IEntityRepository<Organization> organizationRepository,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.OrganizationContext = organizationContext;
            this.CurrentUserContext = currentUserContext;
            this.UserRepository = userRepository;
            this.GroupRepository = groupRepository;
            this.OrganizationRepository = organizationRepository;
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

        public IQueryable<Project> UnfilteredGet()
        {
            return base.Get();
        }

        public override async Task<Project> UpdateAsync(int id, Project entity)
        {
            return await base.UpdateAsync(id, entity);
        }

        public override async Task<Project> CreateAsync(Project entity)
        {
            return await base.CreateAsync(entity);
        }


        private bool ValidateOranizationUpdate(Project projectUpdate, int id)
        {
            // 
            if ((projectUpdate.OrganizationId != 0)
                || (projectUpdate.OwnerId != 0)
                || (projectUpdate.GroupId != 0))
            {
                var original = base.Get()
                    .Where(p => p.Id == id)
                    .Include(p => p.Organization)
                    .Include(p => p.Owner)
                    .Include(p => p.Group)
                       .ThenInclude(g => g.Owner)
                    .FirstOrDefaultAsync().Result;
                var owner = UserRepository.UnfilteredGet()
                        .Where(u => u.Id == original.OwnerId)
                        .Include(u => u.GroupMemberships)
                            .ThenInclude(gm => gm.Group)
                        .Include(u => u.OrganizationMemberships)
                            .ThenInclude(om => om.Organization)
                        .FirstOrDefaultAsync().Result;
                var organization = original.Organization;
                var group = original.Group;
                ValidateOrganization(original.Name, projectUpdate, organization, group, owner);
            }
            return true;
        }
        private void ValidateOrganizationAdd(Project projectCreate)
        {
            if ((projectCreate.OrganizationId != 0)
                && (projectCreate.OwnerId != 0)
                && (projectCreate.GroupId != 0))
            {
                ValidateOrganization(projectCreate.Name, projectCreate, null, null, null );
            }

        }
        private void ValidateOrganization(string Name, Project project, Organization oldOrg, Group oldGroup, User oldOwner)
        {
            var organization = oldOrg;
            var group = oldGroup;
            var owner = oldOwner;
            if (project.OrganizationId != 0)
            {
                organization = OrganizationRepository.Get()
                        .Where(o => o.Id == project.OrganizationId)
                        .FirstOrDefaultAsync().Result;
            }
            if (project.GroupId != 0)
            {
                group = GroupRepository.UnfilteredGet()
                        .Where(g => g.Id == project.GroupId)
                       .Include(g => g.Owner).FirstOrDefaultAsync().Result;
            }
            if (project.OwnerId != 0)
            {
                owner = UserRepository.UnfilteredGet()
                        .Where(u => u.Id == project.OwnerId)
                        .Include(u => u.GroupMemberships)
                            .ThenInclude(gm => gm.Group)
                        .Include(u => u.OrganizationMemberships)
                            .ThenInclude(om => om.Organization)
                        .FirstOrDefaultAsync().Result;
            }

            if ((organization == null) || (group == null) || (owner == null))
            {
                // Allowing it to return in these cases should cause the base to hit normal
                // foreign key failures
                var message = $"Project '{project.Name}': Organization Group or Owner not present or invalid"; 
                Log.Error(message);
                return;
            }
            if (organization != group.Owner)
            {
                var message = $"Project '{project.Name}': Group '{group.Name}' not owned by project organization '{organization.Name}'";
                Log.Error(message);
                throw new Exception(message);

            }
            if ((owner.OrganizationIds == null) || (!owner.OrganizationIds.Contains(organization.Id)))
            {
                var message = $"Project '{project.Name}': Owner '{owner.Name}' not a member of project organization '{organization.Name}'";
                Log.Error(message);
                throw new Exception(message);
            }
             
        }
    }
}
