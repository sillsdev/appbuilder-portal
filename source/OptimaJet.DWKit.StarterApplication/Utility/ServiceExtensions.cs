using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class ServiceExtensions
    {
        public static async Task<IEnumerable<T>> GetScopedToOrganization<T>(
            Func<Task<IEnumerable<T>>> baseQuery,
            IOrganizationContext organizationContext,
            IJsonApiContext jsonApiContext

        )
        {
            if (organizationContext.SpecifiedOrganizationDoesNotExist)
            {
                return Enumerable.Empty<T>().AsQueryable();
            }
            else if (!organizationContext.IsOrganizationHeaderPresent) 
            {
                // Include:
                // - All public organizations
                // - All private organizations the current user has access to
                return await baseQuery();
            }
            else
            {
                var query = jsonApiContext.QuerySet;
                var orgIdToFilterBy = "";

                if (query == null)
                {
                    query = new QuerySet();
                    jsonApiContext.QuerySet = query;
                }

                if (organizationContext.HasOrganization) 
                {
                    orgIdToFilterBy = organizationContext.OrganizationId.ToString();
                }
                
                query.Filters.Add(new JsonApiDotNetCore.Internal.Query.FilterQuery("organization-header", orgIdToFilterBy, "="));

                return await baseQuery();
            }

        }
    }
}
