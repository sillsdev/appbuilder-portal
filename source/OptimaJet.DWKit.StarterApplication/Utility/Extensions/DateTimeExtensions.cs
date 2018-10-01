using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Utility.Extensions
{
    public static class DateTimeExtensions
    {

        public static string ToISO8601(this DateTime value)
        {
            return value.ToString("yyyy-MM-ddTHH:mm:ssK");
        }
    }
}

