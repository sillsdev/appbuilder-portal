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
            Func<Task<IEnumerable<T>>> baseGetAsync,
            IOrganizationContext organizationContext,
            IJsonApiContext jsonApiContext

        )
        {
            if (organizationContext.SpecifiedOrganizationDoesNotExist)
            {
                return Enumerable.Empty<T>().AsQueryable();
            }
            else
            {
                var query = jsonApiContext.QuerySet;
                if (query == null)
                {
                    query = new QuerySet();
                    jsonApiContext.QuerySet = query;
                }
                var value = organizationContext.HasOrganization ? organizationContext.OrganizationId.ToString() : "";
                query.Filters.Add(new JsonApiDotNetCore.Internal.Query.FilterQuery("organization-header", value, "="));
                return await baseGetAsync(); //base.GetAsync();
            }

        }
    }
}
