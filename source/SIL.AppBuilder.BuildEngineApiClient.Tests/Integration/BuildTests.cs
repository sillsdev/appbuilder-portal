using System;
using Xunit;

namespace SIL.AppBuilder.BuildEngineApiClient.Tests.Integration
{
    public class BuildTests
    {
        // Note: You should set these values to match your environment.  These
        // tests are not intended to be automated, just to interact with a real 
        // system and show how the API is used.
        //
        const string skipIntegrationTest = "Integration Test disabled"; // Set to null to be able to run/debug using Unit Test Runner
        public string BaseUrl { get; set; } = "https://buildengine.gtis.guru:8443"; // This is our staging version of BuildEngine
        public string ApiAccessKey { get; set; } = "";

        // This test assumes that the job exists and that the build ID being passed has
        // completed successfully
        [Theory(Skip = skipIntegrationTest)]
        [InlineData(2, 1)]
        public void GetTestJob(int jobId, int buildId)
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.GetBuild(jobId, buildId);
            Assert.NotNull(response);
            Assert.Equal(buildId, response.Id);
            Assert.Equal(jobId, response.JobId);
            Assert.Equal("SUCCESS", response.Result);
            Assert.Equal("completed", response.Status);
            Assert.Null(response.Error);
            Assert.Equal(7, response.Artifacts.Count);
            Assert.True(response.Artifacts.ContainsKey("apk"));
            Assert.True(response.Artifacts.ContainsKey("about"));
            Assert.True(response.Artifacts.ContainsKey("play-listing"));
            Assert.True(response.Artifacts.ContainsKey("version_code"));
            Assert.True(response.Artifacts.ContainsKey("package_name"));
            Assert.True(response.Artifacts.ContainsKey("cloudWatch"));
            Assert.True(response.Artifacts.ContainsKey("consoleText"));
            Assert.Contains("about.txt", response.Artifacts["about"]);
            Assert.Contains("index.html", response.Artifacts["play-listing"]);
            Assert.Contains("version_code.txt", response.Artifacts["version_code"]);
            Assert.Contains("package_name.txt", response.Artifacts["package_name"]);
        }
        // This test assumes that the job exists and that one or more builds have been run
        [Theory(Skip = skipIntegrationTest)]
        [InlineData(2)]
        public void GetTestJobs(int jobId)
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var responses = client.GetBuilds(jobId);
            Assert.NotNull(responses);
            Assert.True(responses.Count > 0);
            foreach (BuildResponse response in responses)
            {
                Assert.Equal(jobId, response.JobId);
                Assert.Equal(7, response.Artifacts.Count);
                if (response.Status == "completed")
                {
                    Assert.True((response.Result == "SUCCESS")
                                || (response.Result == "FAILURE")
                                || (response.Result == "ABORTED"));
                }
                Assert.NotEqual(0, response.Id);
            }
        }

        // This test assumes that a job with the ID being passed in already exists before the
        // test is run
        [Theory(Skip = skipIntegrationTest)]
        [InlineData(2)]
        public void CreateTestBuild(int jobId)
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.CreateBuild(jobId);
            Assert.NotNull(response);
            Assert.Equal("initialized", response.Status);
            Assert.NotEqual(0, response.Id);
            Assert.Equal(2, response.JobId);
            Assert.Equal(7, response.Artifacts.Count);
        }

        // This test assumes that the job and build exist
        [Theory(Skip = skipIntegrationTest)]
        [InlineData(2,2)]
        public void DeleteTestBuild(int jobId, int buildId)
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.DeleteBuild(jobId, buildId);
            Assert.Equal(System.Net.HttpStatusCode.OK, response);
        }

    }
}
