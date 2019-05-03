using System;
namespace SIL.AppBuilder.BuildEngineApiClient
{
    public class TokenResponse
    {
        public String SessionToken { get; set; }
        public String SecretAccessKey { get; set; }
        public String AccessKeyId { get; set; }
        public String Expiration { get; set; }
        public String Region { get; set; }
    }
}
