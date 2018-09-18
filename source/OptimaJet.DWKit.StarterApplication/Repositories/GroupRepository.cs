using System;
using System.Collections.Generic;
using System.Linq;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using static OptimaJet.DWKit.StarterApplication.Utility.IEnumerableExtensions;
using static OptimaJet.DWKit.StarterApplication.Utility.RepositoryExtensions;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class GroupRepository : ControllerRepository<Group>
    {
        public IOrganizationContext OrganizationContext { get; }
        public UserRepository UserRepository { get; }
        public ICurrentUserContext CurrentUserContext { get; }


        public GroupRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            UserRepository userRepository,
            ICurrentUserContext currentUserContext,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.OrganizationContext = organizationContext;
            this.UserRepository = userRepository;
            this.CurrentUserContext = currentUserContext;
        }
        public override IQueryable<Group> Filter(IQueryable<Group> query, FilterQuery filterQuery)
        {
            return query.OptionallyFilterOnQueryParam(filterQuery,
                                                      "organization-header",
                                                      UserRepository,
                                                      CurrentUserContext,
                                                      GetWithFilter,
                                                      base.Filter,
                                                      GetWithOwnerId,
                                                      GetWithOrganizationContext);
        }

        private IQueryable<Group> GetWithOwnerId(IQueryable<Group> query,
                                                        IEnumerable<int> orgIds)
        {
            // Get all groups where the current user
            // is a member of the group owner
            return query
                .Where(g => orgIds.Contains(g.OwnerId));
        }

        private IQueryable<Group> GetWithOrganizationContext(IQueryable<Group> query,
                                                             IEnumerable<int>orgIds )
        {
            // Get groups owned by the current organization specified if the current user is a 
            // member of that organization
            return query
                .Where(g => (g.OwnerId == OrganizationContext.OrganizationId)
                       && (orgIds.Contains(g.OwnerId)));
        }

    }
}