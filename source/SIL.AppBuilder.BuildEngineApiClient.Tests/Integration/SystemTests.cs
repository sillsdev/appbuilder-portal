using System;
using Xunit;
namespace SIL.AppBuilder.BuildEngineApiClient.Tests.Integration
{
    public class SystemTests
    {
        public string BaseUrl { get; set; } = "https://buildengine.gtis.guru";
        public string ApiAccessKey { get; set; } = "BNLAVlQ7xlBoSqvRNbS153FqCWfcVCpX";

        [Fact]
        public void GetTestProject()
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.SystemCheck();
            Assert.Equal(System.Net.HttpStatusCode.OK, response);
        }
    }
}
