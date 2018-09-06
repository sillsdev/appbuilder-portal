using System;
using System.Collections.Generic;
using System.Linq;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class IEnumerableExtensions
    {
        public static IEnumerable<T> OrEmpty<T>(this IEnumerable<T> list)
        {
            return list ?? Enumerable.Empty<T>();
        }
    }
}
