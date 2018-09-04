using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using static OptimaJet.DWKit.StarterApplication.Utility.IEnumerableExtensions;
using static OptimaJet.DWKit.StarterApplication.Utility.RepositoryExtensions;

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
            return query.OptionallyFilterOnQueryParam(filterQuery,
                                          "organization-id",
                                          this,
                                          CurrentUserContext,
                                          GetWithOrganizationId,
                                          FilterOnOrganizationHeader,
                                          null,
                                          null);

        }
        protected IQueryable<User> FilterOnOrganizationHeader(IQueryable<User>query, FilterQuery filterQuery)
        {
            return query.OptionallyFilterOnQueryParam(filterQuery,
                                          "organization-header",
                                          this,
                                          CurrentUserContext,
                                          GetWithFilter,
                                          base.Filter,
                                         GetAllUsersByCurrentUser,
                                         GetWithOrganizationContext);

        }
        private IQueryable<User> GetAllUsersByCurrentUser(IQueryable<User> query,
                                               IEnumerable<int> orgIds)
        {
            // Get all users in the all the 
            // organizations that the current user is a member

            return query
                .Where(u => u.OrganizationMemberships
                            .Select(o => o.OrganizationId)
                            .Intersect(orgIds)
                            .Any());
        }
        private IQueryable<User> GetWithOrganizationContext(IQueryable<User> query,
                                                IEnumerable<int> orgIds)
        {
            // Get users in the current organization
            return query
                .Where(u => u.OrganizationMemberships
                            .Any(o => o.OrganizationId == OrganizationContext.OrganizationId));
        }
        private IQueryable<User> GetWithOrganizationId(IQueryable<User> query,
               string value,
               UserRepository userRepository,
               ICurrentUserContext currentUserContext,
               Func<IQueryable<User>, IEnumerable<int>, IQueryable<User>> query1,
               Func<IQueryable<User>, IEnumerable<int>, IQueryable<User>> query2)
        {
            return query.Where(
                      u => u.OrganizationMemberships
                     .Any(om => om.OrganizationId.ToString() == value));
        }

        public async Task<User> GetByAuth0Id(string auth0Id)
        {
            return await base.Get()
                       .Where(e => e.ExternalId == auth0Id)
                       .Include(user => user.OrganizationMemberships)
                       .FirstOrDefaultAsync();
        }
    }
}
