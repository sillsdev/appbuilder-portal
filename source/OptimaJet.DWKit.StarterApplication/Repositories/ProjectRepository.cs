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

            if (filterQuery.Has(PROJECT_UPDATED_DATE)) {
                var date = value.DateTimeFromISO8601();

                switch(op) {
                    case FilterOperations.ge:
                        return query
                            .Where(p => p.DateUpdated > date);
                    case FilterOperations.le:
                        return query
                            .Where(p => p.DateUpdated < date);
                }
            }

            if (filterQuery.Has(PROJECT_PRODUCT_NAME_ANY)) {
                return query
                    .Include(p => p.Products)
                    .ThenInclude(product => product.ProductDefinition)
                    .Where(p => p.Products
                        .Any(product => EFUtils.Like(product.ProductDefinition.Name, value)));
            }

            if (filterQuery.Has(PROJECT_PRODUCT_DEFINITION_ID_ANY)) {
                return query
                    .Include(p => p.Products)
                    .Where(p => p.Products
                        .Any(product => product.ProductDefinitionId.ToString() == value));
            }

            if (filterQuery.Has(PROJECT_SEARCH_TERM)) {
                return query
                    .Include(p => p.Owner)
                    .Include(p => p.Organization)
                    .Where(p => (
                        EFUtils.Like(p.Name, value) 
                        || EFUtils.Like(p.Language, value)
                        || EFUtils.Like(p.Organization.Name, value)
                        || EFUtils.Like(p.Owner.Name, value)
                    ));
            }

            
            return base.Filter(query, filterQuery);
        }

        public override IQueryable<Project> Sort(IQueryable<Project> entities, List<SortQuery> sortQueries)
        {
            return base.Sort(entities, sortQueries);
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
