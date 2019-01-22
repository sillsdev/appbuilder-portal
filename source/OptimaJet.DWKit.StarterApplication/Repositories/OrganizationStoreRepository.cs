using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Utility.Extensions.JSONAPI;
using static OptimaJet.DWKit.StarterApplication.Utility.IEnumerableExtensions;
using static OptimaJet.DWKit.StarterApplication.Utility.RepositoryExtensions;
using static OptimaJet.DWKit.StarterApplication.Utility.Extensions.JSONAPI.FilterQueryExtensions;
using static OptimaJet.DWKit.StarterApplication.Utility.Extensions.StringExtensions;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class OrganizationStoreRepository : BaseRepository<OrganizationStore>
    {

    public OrganizationStoreRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            CurrentUserRepository currentUserRepository,
            IDbContextResolver contextResolver
        ) : base(loggerFactory, jsonApiContext, currentUserRepository, contextResolver)
        {
        }

        public override IQueryable<OrganizationStore> Filter(IQueryable<OrganizationStore> query, FilterQuery filterQuery)
        {            
            if (filterQuery.Has(ORGANIZATION_HEADER)) 
            {
                var orgIds = CurrentUser.OrganizationIds.OrEmpty();

                return query.FilterByOrganization(filterQuery, allowedOrganizationIds: orgIds);
            }

        
            return base.Filter(query, filterQuery);
        }
    }
}
