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
    public static class EnumExtensions
    {

        // https://stackoverflow.com/a/40358579/356849
        // https://stackoverflow.com/a/424380/356849
        public static string AsString<T>(this T enumValue) where T : IConvertible
        {
            if (!typeof(T).IsEnum) {
              throw new ArgumentException("T must be an enumerated type");
            }

            return Enum.GetName(typeof(T), enumValue);
        }
    }
}

