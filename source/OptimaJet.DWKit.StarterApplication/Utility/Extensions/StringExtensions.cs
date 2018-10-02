using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Utility.Extensions
{
    public static class StringExtensions
    {

        public static T ToEnum<T>(this string value, T defaultValue)
        {
            if (string.IsNullOrEmpty(value))
            {
                return defaultValue;
            }

            return (T) Enum.Parse(typeof(T), value, true);
        }

        public static DateTime DateTimeFromISO8601(this string value)
        {
            return DateTime.Parse(value, null, System.Globalization.DateTimeStyles.AdjustToUniversal);
        }
    }
}

