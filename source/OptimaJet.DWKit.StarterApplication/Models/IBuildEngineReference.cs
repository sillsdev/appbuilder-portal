using System;
using System.Collections.Generic;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public interface IBuildEngineReference
    {
        string BuildEngineUrl { get; set; }
        string BuildEngineApiAccessToken { get; set; }
    }
    public class BuildEngineReferenceComparer : IEqualityComparer<IBuildEngineReference>
    {
        public bool Equals(IBuildEngineReference x, IBuildEngineReference y)
        {
            if (Object.ReferenceEquals(x, y)) return true;
            if (Object.ReferenceEquals(x, null) || Object.ReferenceEquals(y, null))
            {
                return false;
            }
            return x.BuildEngineApiAccessToken == y.BuildEngineApiAccessToken && x.BuildEngineUrl == y.BuildEngineUrl;
        }

        public int GetHashCode(IBuildEngineReference obj)
        {
            if (obj == null)
            {
                return 0;
            }

            return 37 * obj.BuildEngineUrl.GetHashCode() + 19 * obj.BuildEngineApiAccessToken.GetHashCode();
        }
    }

}
