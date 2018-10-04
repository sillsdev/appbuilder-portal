using System;
namespace SIL.AppBuilder.BuildEngineApiClient
{
    public class JobResponse: Job
    {
        public int Id { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
    }
}
