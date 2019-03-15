using System;
using System.Collections.Generic;

namespace SIL.AppBuilder.BuildEngineApiClient
{
    // Is not derived from Build because Environment does not deserialize 
    // correctly and is not needed in response
    public class BuildResponse
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public String Status { get; set; }
        public String Result { get; set; }
        public String Error { get; set; }
        public string Targets { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public Dictionary<String, String> Artifacts { get; set; }
    }
}
