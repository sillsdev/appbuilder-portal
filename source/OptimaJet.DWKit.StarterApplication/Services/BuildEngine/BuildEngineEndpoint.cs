using System;
namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineEndpoint
    {
        public string Url { get; set; }
        public string ApiAccessToken { get; set; }
        public bool IsValid()
        {
            return Url != null && ApiAccessToken != null;
        }
    }
}
