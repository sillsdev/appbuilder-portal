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
    public class GroupRepository : BaseRepository<Group>
    {
        public IOrganizationContext OrganizationContext { get; }
        public UserRepository UserRepository { get; }
        public ICurrentUserContext CurrentUserContext { get; }


        public GroupRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            UserRepository userRepository,
            CurrentUserRepository currentUserRepository,
            ICurrentUserContext currentUserContext,
            EntityHooksService<Group, int> statusUpdateService,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, currentUserRepository, statusUpdateService, contextResolver)
        {
            this.OrganizationContext = organizationContext;
            this.UserRepository = userRepository;
            this.CurrentUserContext = currentUserContext;
        }
        public override IQueryable<Group> Filter(IQueryable<Group> entities, FilterQuery filterQuery)
        {
            return entities.OptionallyFilterOnQueryParam(filterQuery,
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