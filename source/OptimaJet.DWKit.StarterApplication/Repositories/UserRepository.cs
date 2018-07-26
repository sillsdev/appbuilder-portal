using System;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class UserRepository : DefaultEntityRepository<User>
    {
        public IOrganizationContext OrganizationContext { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public UserRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.OrganizationContext = organizationContext;
            this.CurrentUserContext = currentUserContext;
        }

        public override IQueryable<User> Get()
        {
            if (OrganizationContext.InvalidOrganization) return base.Get().Take(0);
            if (!OrganizationContext.HasOrganization)
            {
                // No organization specified, so include all users in the all the organizations that the current user is a member
                var currentUser = GetByAuth0Id(CurrentUserContext.Auth0Id).Result;
                var currentUserOrgIds = currentUser.OrganizationMemberships.Select(o => o.OrganizationId);
                return base.Get()
                           .Include(u => u.OrganizationMemberships)
                           .Where(u => u.OrganizationMemberships.Select(o => o.OrganizationId).Intersect(currentUserOrgIds).Any());
            }
            else
            {
                // Get users in the current organization
                return base.Get()
                           .Include(u => u.OrganizationMemberships)
                           .Where(u => u.OrganizationMemberships.Any(o => o.OrganizationId == OrganizationContext.OrganizationId));
            }
        }

        public async Task<User> GetByAuth0Id(string auth0Id)
            => await base.Get()
                .Where(e => e.ExternalId == auth0Id)
                .Include(u => u.OrganizationMemberships)
                    .ThenInclude(om => om.Organization)
                .FirstOrDefaultAsync();
    }
}
