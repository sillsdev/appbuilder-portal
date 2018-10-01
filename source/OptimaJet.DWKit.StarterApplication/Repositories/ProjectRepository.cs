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

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class ProjectRepository : BaseRepository<Project>
    {

    public ProjectRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            CurrentUserRepository currentUserRepository,
            IDbContextResolver contextResolver
        ) : base(loggerFactory, jsonApiContext, currentUserRepository, contextResolver)
        {
        }

        public override IQueryable<Project> Filter(IQueryable<Project> query, FilterQuery filterQuery)
        {            
            if (filterQuery.Has(ORGANIZATION_HEADER)) 
            {
                var orgIds = CurrentUser.OrganizationIds.OrEmpty();

                return query.FilterByOrganization(filterQuery, allowedOrganizationIds: orgIds);
            }

            var value = filterQuery.Value;
            var op = filterQuery.Operation.ToEnum<FilterOperations>(defaultValue: FilterOperations.eq);

            if (filterQuery.Has(PROJECT_PRODUCT_BUILD_DATE)) {
                var date = DateTime.Parse(value);

                switch(op) {
                    case FilterOperations.ge:
                        return query
                            .Include(p => p.Products)
                            .Where(p => p.Products.Any(product => product.DateBuilt > date));
                    case FilterOperations.le:
                        return query
                            .Include(p => p.Products)
                            .Where(p => p.Products.Any(product => product.DateBuilt < date));
                }
            }

            if (filterQuery.Has(PROJECT_PRODUCT_NAME_ANY)) {
                return query
                    .Include(p => p.Products)
                    .ThenInclude(product => product.ProductDefinition)
                    .Where(p => p.Products
                        .Any(product => product.ProductDefinition.Name.Contains(value)));
            }

            
            return base.Filter(query, filterQuery);
        }

        // This is the set of all projects that a user has access to.
        // If a project would ever need to be accessed outside of this set of projects,
        // this method should not be used.
        public override IQueryable<Project> Get() 
        {
            var orgIds = CurrentUser.OrganizationIds.OrEmpty();

            return base.Get().Where(p => p.IsPublic == true || orgIds.Contains(p.OrganizationId));
        }
    }
}
