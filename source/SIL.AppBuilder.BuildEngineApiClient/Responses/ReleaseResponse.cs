using System;

namespace SIL.AppBuilder.BuildEngineApiClient
{
    public class ReleaseResponse: Release
    {
        public int Id { get; set; }
        public int BuildId { get; set; }
        public string Status { get; set; }
        public string Result { get; set; }
        public string Error { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
    }
}
