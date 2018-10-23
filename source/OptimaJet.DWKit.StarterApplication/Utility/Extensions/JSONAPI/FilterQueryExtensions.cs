using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Utility.Extensions.JSONAPI
{
    public static class FilterQueryExtensions
    {
        public static string ORGANIZATION_HEADER = "organization-header";
        public static string PROJECT_SEARCH_TERM = "search-term";
        public static string PROJECT_PRODUCT_NAME_ANY = "any-product-name";
        public static string PROJECT_PRODUCT_DEFINITION_ID_ANY = "any-product-definition-id";
        public static string PROJECT_PRODUCT_BUILD_DATE = "product-build-date";
        public static string PROJECT_PRODUCT_CREATED_DATE = "product-created-date";
        public static string PROJECT_UPDATED_DATE = "project-updated-date";


        public static bool Has(this FilterQuery filterQuery, string param)
        {
          var attribute = filterQuery.Attribute;

          return attribute.Equals(param, StringComparison.OrdinalIgnoreCase);
        }
    }
}