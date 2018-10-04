using System;
using Xunit;

namespace SIL.AppBuilder.BuildEngineApiClient.Tests.Integration
{
    public class JobTests
    {
        // Note: You should set these values to match your environment.  These
        // tests are not intended to be automated, just to interact with a real 
        // system and show how the API is used.
        //
        const string skipIntegrationTest = "Integration Test disabled"; // Set to null to be able to run/debug using Unit Test Runner
        public string BaseUrl { get; set; } = "https://buildengine.gtis.guru:8443"; // This is our staging version of BuildEngine
        public string ApiAccessKey { get; set; } = "";
        public string GitUrl { get; set; } = ""; // Amazon Codecommit URL: Example ssh://APKAIKQTCJ3JIDKLHHDA@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-DEM-LSDEV-eng-US-English-Greek
        public string AppId { get; set; } = ""; // scriptureappbuilder
        public string PublisherId { get; set; } = "";  // wycliffeusa

        [Theory(Skip = skipIntegrationTest)]
        [InlineData(1)]
        public void GetTestJob(int jobId)
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.GetJob(jobId);
            Assert.NotNull(response);
            Assert.Equal(this.GitUrl, response.GitUrl);
            Assert.Equal(this.AppId, response.AppId);
            Assert.Equal(this.PublisherId, response.PublisherId);
            Assert.Equal(jobId, response.Id);
        }
        [Fact(Skip = skipIntegrationTest)]
        public void GetTestJobs()
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.GetJobs();
            Assert.NotNull(response);
        }

        [Fact(Skip = skipIntegrationTest)]
        public void CreateTestJob()
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var job = new Job
            {
                RequestId = Guid.NewGuid().ToString(),
                GitUrl = this.GitUrl,
                AppId = "scriptureappbuilder",
                PublisherId = this.PublisherId
            };

            var response = client.CreateJob(job);
            Assert.NotNull(response);
            Assert.Equal(job.RequestId, response.RequestId);
            Assert.Equal(job.GitUrl, response.GitUrl);
            Assert.Equal(job.AppId, response.AppId);
            Assert.Equal(job.PublisherId, response.PublisherId);
            Assert.NotEqual(0, response.Id);
            Assert.NotEqual(DateTime.MinValue, response.Created);
            Assert.NotEqual(DateTime.MinValue, response.Updated);
        }

        [Theory (Skip = skipIntegrationTest)]
        [InlineData(1)]
        public void DeleteTestProject(int jobId)
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.DeleteJob(jobId);
            Assert.Equal(System.Net.HttpStatusCode.OK, response);
        }

    }
}
