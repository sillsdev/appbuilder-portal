using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
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
            var dt = value.ToString("yyyy-MM-ddTHH:mm:ssK");
            // remove timezone offset if it's UTC
            var result = Regex.Replace(dt, @"00:00$", "");

            return result;
        }
    }
}

