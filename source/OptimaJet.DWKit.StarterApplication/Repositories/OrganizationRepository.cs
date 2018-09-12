using System;
using System.Collections.Generic;
using System.Linq;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using static OptimaJet.DWKit.StarterApplication.Utility.IEnumerableExtensions;
using static OptimaJet.DWKit.StarterApplication.Utility.RepositoryExtensions;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class OrganizationRepository : ControllerRepository<Organization>
    {
        public CurrentUserRepository CurrentUserRepository { get; }


        public OrganizationRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            CurrentUserRepository currentUserRepository,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.CurrentUserRepository = currentUserRepository;
        }
        public override IQueryable<Organization> Filter(IQueryable<Organization> query, FilterQuery filterQuery)
        {
            var attribute = filterQuery.Attribute;
            var value = filterQuery.Value;
            var isScopeToUser = attribute.Equals("scope-to-current-user", StringComparison.OrdinalIgnoreCase);

            if (isScopeToUser) {
                var currentUser = CurrentUserRepository.GetCurrentUser().Result;

                var orgIds = currentUser.OrganizationIds.OrEmpty();

                var scopedToUser = query.Where(organization => orgIds.Contains(organization.Id));

                // return base.Filter(scopedToUser, filterQuery);
                return scopedToUser;
            }

            return base.Filter(query, filterQuery);
        }
    }
}
