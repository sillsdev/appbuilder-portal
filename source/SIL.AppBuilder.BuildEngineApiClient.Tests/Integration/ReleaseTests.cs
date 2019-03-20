using System;
using System.Collections.Generic;
using Xunit;

namespace SIL.AppBuilder.BuildEngineApiClient.Tests.Integration
{
    public class ReleaseTests
    {
        // Note: You should set these values to match your environment.  These
        // tests are not intended to be automated, just to interact with a real 
        // system and show how the API is used.
        //
        const string skipIntegrationTest = "Integration Test disabled"; // Set to null to be able to run/debug using Unit Test Runner
        public string BaseUrl { get; set; } = "https://buildengine.gtis.guru:8443"; // This is our staging version of BuildEngine
        public string ApiAccessKey { get; set; } = "replace";

        // This test assumes that the job exists and that the build ID being passed has
        // completed successfully
        [Theory(Skip = skipIntegrationTest)]
        [InlineData(4, 5, 1)]
        public void GetTestRelease(int jobId, int buildId, int releaseId)
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.GetRelease(jobId, buildId, releaseId);
            Assert.NotNull(response);
            Assert.Equal(releaseId, response.Id);
            Assert.Equal(buildId, response.BuildId);
            Assert.Equal("completed", response.Status);
            Assert.Equal("SUCCESS", response.Result);
            Assert.Null(response.Error);
        }

        // This test assumes that a job and build with the IDs being passed in already exists before the
        // test is run
        [Theory(Skip = skipIntegrationTest)]
        [InlineData(1, 8)]
        public void CreateTestBuild(int jobId,int buildId)
        {
            var env = new Dictionary<string, string>
            {
                {"VAR1", "VALUE1"},
                {"VAR2", "VALUE2"}
            };
            var release = new Release
            {
                Channel = "alpha",
                Targets = "google-play",
                Environment = env
             };
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.CreateRelease(jobId, buildId, release);
            Assert.NotNull(response);
            Assert.Equal("initialized", response.Status);
            Assert.NotEqual(0, response.Id);
        }

        // This test assumes that the job, build and release exist
        [Theory(Skip = skipIntegrationTest)]
        [InlineData(4, 5, 2)]
        public void DeleteTestBuild(int jobId, int buildId, int releaseId)
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.DeleteRelease(jobId, buildId, releaseId);
            Assert.Equal(System.Net.HttpStatusCode.OK, response);
        }
    }
}
