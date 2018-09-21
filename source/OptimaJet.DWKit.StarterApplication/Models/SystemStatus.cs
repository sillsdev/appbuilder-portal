using System;
using JsonApiDotNetCore.Models;
using OptimaJet.DWKit.StarterApplication.Models;

namespace Optimajet.DWKit.StarterApplication.Models
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
