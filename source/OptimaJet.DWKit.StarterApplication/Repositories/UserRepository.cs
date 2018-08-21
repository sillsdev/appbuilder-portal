using System;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal.Query;
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

        public override IQueryable<User> Filter(IQueryable<User> query, FilterQuery filterQuery)
        {
            var attribute = filterQuery.Attribute;
            var value = filterQuery.Value;
            var isOrgId = attribute.Equals("organization-id", StringComparison.OrdinalIgnoreCase);

            if (isOrgId) {
                // TODO: would it make sense to define a custom predicate for this usage?
                //       semantically, this would be:
                //          ?filter[organization-memberships.organization-id]=anyEq:orgId
                //
                // NOTE: Current usage is:
                //          ?filter[organization-id]=orgId
                return query.Where(
                    u => u.OrganizationMemberships
                          .Any(om => om.OrganizationId.ToString() == value));
            }

            return base.Filter(query, filterQuery);
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
                var orgIds = currentUser.OrganizationIds ?? Enumerable.Empty<int>();

                return query
                    .Where(u => (
                        u.Id == currentUser.Id 
                        || (u.OrganizationMemberships
                                .Select(o => o.OrganizationId)
                                .Intersect(orgIds)
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
                .Include(user => user.OrganizationMemberships)
                .FirstOrDefaultAsync();
    }
}
