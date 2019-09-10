using Amazon;
using Amazon.Runtime;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class AmazonSenderOptions
    {
        public RegionEndpoint RegionEndpoint { get; set; }
        public AWSCredentials Credentials { get; set; } 
    }
}
