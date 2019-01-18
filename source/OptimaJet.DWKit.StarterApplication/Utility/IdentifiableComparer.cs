using System;
using System.Collections;
using System.Collections.Generic;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public class IdentifiableComparer : IEqualityComparer<Identifiable>
    {
        public bool Equals(Identifiable x, Identifiable y)
        {
            return x.Id == y.Id;
        }

        public int GetHashCode(Identifiable obj)
        {
            return obj.Id;
        }
    }
}
