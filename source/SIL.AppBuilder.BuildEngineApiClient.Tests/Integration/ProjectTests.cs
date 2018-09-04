using System;
using Xunit;

namespace SIL.AppBuilder.BuildEngineApiClient.Tests.Integration
{
    public class ProjectTests
    {
        // Note: You should set these values to match your environment.  These
        // tests are not intended to be automated, just to interact with a real 
        // system and show how the API is used.
        //
        const string skipIntegrationTest = "Integration Test disabled"; // Set to null to be able to run/debug using Unit Test Runner
        public string BaseUrl { get; set; } = "https://buildengine.gtis.guru"; // This is our staging version of BuildEngine
        public string ApiAccessKey { get; set; } = "";
        public string UserId { get; set; } = ""; // Email address
        public string GroupId { get; set; } = ""; // Some shared group
        public string PublishingKey { get; set; } = ""; // Get this from Scripture App Builder

        [Theory(Skip = skipIntegrationTest)]
        [InlineData(4)]
        public void GetTestProject(int projectId)
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.GetProject(projectId);
            Assert.NotNull(response);
        }

        [Fact(Skip = skipIntegrationTest)]
        public void GetTestProjects()
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.GetProjects();
            Assert.NotNull(response);
        }


        [Fact(Skip = skipIntegrationTest)]
        public void CreateTestProject()
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var project = new Project
            {
                UserId = this.UserId,
                GroupId = this.GroupId,
                AppId = "scriptureappbuilder",
                LanguageCode = "eng",
                ProjectName = Guid.NewGuid().ToString(),
                PublishingKey = this.PublishingKey
            };

            var response = client.CreateProject(project);
            Assert.NotNull(response);
            Assert.Equal(project.UserId, response.UserId);
            Assert.Equal(project.GroupId, response.GroupId);
            Assert.Equal(project.AppId, response.AppId);
            Assert.Equal(project.LanguageCode, response.LanguageCode);
            Assert.Equal("initialized", response.Status);
            Assert.Null(response.Result);
            Assert.Null(response.Error);
            Assert.Null(response.Url);
            Assert.NotEqual(DateTime.MinValue, response.Created);
            Assert.NotEqual(DateTime.MinValue, response.Updated);
        }

        [Theory(Skip = skipIntegrationTest)]
        [InlineData(5)]
        public void DeleteTestProject(int projectId)
        {
            var client = new BuildEngineApi(BaseUrl, ApiAccessKey);
            var response = client.DeleteProject(projectId);
            Assert.Equal(System.Net.HttpStatusCode.OK, response);
        }
    }
}
