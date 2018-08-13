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
    public class UserRepository : ControllerRepository<User>
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

        protected IQueryable<User> DefaultGet()
        {
            return base.Get()
                .Include(u => u.GroupMemberships)
                    .ThenInclude(gm => gm.Group)
                .Include(u => u.OrganizationMemberships)
                    .ThenInclude(om => om.Organization);
        }
        public override IQueryable<User> Get()
        {
            if (OrganizationContext.SpecifiedOrganizationDoesNotExist) return Enumerable.Empty<User>().AsQueryable();
            if (!OrganizationContext.HasOrganization)
            {
                // No organization specified, so include all users in the all the organizations that the current user is a member
                var currentUser = GetByAuth0Id(CurrentUserContext.Auth0Id).Result;
                return DefaultGet()
                           .Where(u => u.OrganizationMemberships.Select(o => o.OrganizationId).Intersect(currentUser.OrganizationIds).Any());
            }
            // Get users in the current organization
            return DefaultGet()
                       .Where(u => u.OrganizationMemberships.Any(o => o.OrganizationId == OrganizationContext.OrganizationId));
        }

        public override async Task<User> GetAsync(int id)
        {
            // The default implementation filters by selected organization.  The 
            // current user might not be in that organization.
            // Always allow getting the current user. 
            var currentUser = await GetByAuth0Id(CurrentUserContext.Auth0Id);
            if (currentUser != null && currentUser.Id == id) {
                return await DefaultGet().Where(e => e.Id == id).FirstAsync();
            }
            return await base.GetAsync(id);
        }

        public async Task<User> GetByAuth0Id(string auth0Id)
            => await base.Get()
                .Where(e => e.ExternalId == auth0Id)
                .Include(u => u.OrganizationMemberships)
                    .ThenInclude(om => om.Organization)
                .FirstOrDefaultAsync();
    }
}
