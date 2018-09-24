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

        public static bool Has(this FilterQuery filterQuery, string param)
        {
          var attribute = filterQuery.Attribute;

          return attribute.Equals(param, StringComparison.OrdinalIgnoreCase);
        }
    }
}