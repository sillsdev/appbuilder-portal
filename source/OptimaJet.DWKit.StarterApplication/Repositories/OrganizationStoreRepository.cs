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
            EntityHooksService<OrganizationStore> statusUpdateService,
            IDbContextResolver contextResolver
        ) : base(loggerFactory, jsonApiContext, currentUserRepository, statusUpdateService, contextResolver)
        {
        }

        public override IQueryable<OrganizationStore> Filter(IQueryable<OrganizationStore> entities, FilterQuery filterQuery)
        {            
            if (filterQuery.Has(ORGANIZATION_HEADER)) 
            {
                var orgIds = CurrentUser.OrganizationIds.OrEmpty();

                return entities.FilterByOrganization(filterQuery, allowedOrganizationIds: orgIds);
            }

        
            return base.Filter(entities, filterQuery);
        }
    }
}
