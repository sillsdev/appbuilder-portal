using System;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Forms.GroupMemberships;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class OrganizationMembershipService : EntityResourceService<OrganizationMembership>
    {
        public OrganizationMembershipService(
            IJsonApiContext jsonApiContext,
            UserRepository userRepository,
            ICurrentUserContext currentUserContext,
            IEntityRepository<OrganizationMembership> organizationMembershipRepository,
            IEntityRepository<UserRole> userRoleRepository,
            IEntityRepository<Role> roleRepository,
            ILoggerFactory loggerFactory
        ) : base(jsonApiContext, organizationMembershipRepository, loggerFactory)
        {
            UserRepository = userRepository;
            OrganizationMembershipRepository = organizationMembershipRepository;
            UserRoleRepository = userRoleRepository;
            RoleRepository = roleRepository;

        }
        private UserRepository UserRepository { get; set; }
        private IEntityRepository<OrganizationMembership> OrganizationMembershipRepository { get; set; }
        private IEntityRepository<UserRole> UserRoleRepository { get; }
        private IEntityRepository<Role> RoleRepository { get; }

        public async Task<OrganizationMembership> CreateByEmail(OrganizationMembership membership)
        {
            if (membership.Email == null || membership.OrganizationId == 0) return null;

            User userForEmail = UserRepository.Get()
                .Where(p => p.Email == membership.Email)
                .Include(u => u.UserRoles)
                .FirstOrDefault();

            if (userForEmail == null) return null;

            membership.UserId = userForEmail.Id;
            var organizationMembership = await this.MaybeCreateMembership(membership);

            await this.MaybeApplyDefaultRole(userForEmail, organizationMembership);
          
            return organizationMembership;
        }

        private async Task<OrganizationMembership> MaybeCreateMembership(OrganizationMembership membership)
        {
            var existingMembership = await this.OrganizationMembershipRepository
                .Get()
                .Where(om => (
                    om.UserId == membership.UserId 
                    && om.OrganizationId == membership.OrganizationId
                ))
                .FirstOrDefaultAsync();

            if (existingMembership != null) {
                return existingMembership;
            }

            return await this.OrganizationMembershipRepository.CreateAsync(membership);
        }

        private async Task MaybeApplyDefaultRole(User user, OrganizationMembership membership)
        {
            if (membership == null) return;

            var existingRole = user.UserRoles
                ?.Where(r => r.OrganizationId == membership.OrganizationId)
                ?.FirstOrDefault();

            // only add a default role if the user does not already have a role
            // a user _may_ not have a role, but not having a role and using scriptoria
            // *should* be rarer than needing a role. Not having a role is _essentially_
            // read only access -- which doesn't allow for much.
            if (existingRole != null) return;

            var role = this.RoleRepository
                .Get()
                .Where(r => r.RoleName == RoleName.AppBuilder)
                .FirstOrDefault();

            if (role == null) return;

            var userRole = new UserRole {
                User = user,
                Role = role,
                OrganizationId = membership.OrganizationId
            };

            await this.UserRoleRepository.CreateAsync(userRole);
        }
    }
}
