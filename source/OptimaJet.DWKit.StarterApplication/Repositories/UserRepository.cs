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

        public override IQueryable<User> Get()
        {
            if (OrganizationContext.SpecifiedOrganizationDoesNotExist) {
                return Enumerable.Empty<User>().AsQueryable();
            }

            var currentUser = GetByAuth0Id(CurrentUserContext.Auth0Id).Result;

            var query = base.Get();

            if (!OrganizationContext.HasOrganization)
            {
                // No organization specified, so include all users in the all the 
                // organizations that the current user is a member
                return query
                    .Where(u => (
                        u.Id == currentUser.Id 
                        || (u.OrganizationMemberships
                                .Select(o => o.OrganizationId)
                                .Intersect(currentUser.OrganizationIds)
                                .Any()
                            )
                    ));
            }

            // Get users in the current organization
            return query
                .Where(u => (
                    u.Id == currentUser.Id 
                    || (u.OrganizationMemberships
                            .Any(o => o.OrganizationId == OrganizationContext.OrganizationId)
                        )
                ));
        }

        public async Task<User> GetByAuth0Id(string auth0Id)
            => await base.Get()
                .Where(e => e.ExternalId == auth0Id)
                .FirstOrDefaultAsync();
    }
}
