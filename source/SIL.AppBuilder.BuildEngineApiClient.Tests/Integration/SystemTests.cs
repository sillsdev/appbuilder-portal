using System;
using Xunit;
namespace SIL.AppBuilder.BuildEngineApiClient.Tests.Integration
{
    public class SystemTests
    {
        const string skipIntegrationTest = null;//"Integration Test disabled"; // Set to null to be able to run/debug using Unit Test Runner
        public string BaseUrl { get; set; } = "https://buildengine.gtis.guru";
        public string ApiAccessKey { get; set; } = "";

        [Fact(Skip = skipIntegrationTest)]
        public void GetTestProject()
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.SystemCheck();
            Assert.Equal(System.Net.HttpStatusCode.OK, response);
        }
    }
}
