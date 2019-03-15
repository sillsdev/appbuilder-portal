using System;

namespace SIL.AppBuilder.BuildEngineApiClient
{
    // Not derived from Release because Environment does not deserialize correctly
    // and is not needed in response
    public class ReleaseResponse
    {
        public int Id { get; set; }
        public int BuildId { get; set; }
        public string Status { get; set; }
        public string Result { get; set; }
        public string Error { get; set; }
        public String Channel { get; set; }
        public string Targets { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
    }
}
