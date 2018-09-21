using System;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class SystemStatus : Identifiable, ITrackDate, IBuildEngineReference
    {
        [Attr("build-engine-url")]
        public string BuildEngineUrl { get; set; }
        [Attr("build-engine-api-access-token")]
        public string BuildEngineApiAccessToken { get; set; }
        [Attr("system-available")]
        public bool SystemAvailable { get; set; }
        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }
        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }
    }
}
