using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using Moq;
using Newtonsoft.Json;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services.Workflow;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Products
{
    [Collection("WithoutAuthCollection")]
    public class GetPublishedFilesTest : BaseProductTest
    {
        public GetPublishedFilesTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }
        [Fact]
        public async Task Get_Latest_Published_Apk_File()
        {
            BuildTestData();

            var url = $"/api/products/{product1.Id}/files/published/apk";
            var response = await Get(url);

            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);

            Assert.Equal(productArtifact2_1.Url, response.Headers.Location.ToString()); 
        }
        [Fact]
        public async Task NotFoundNoBuilds()
        {
            BuildTestData();

            var url = $"/api/products/{product2.Id}/files/published/apk";
            var response = await Get(url);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
        [Fact]
        public async Task NotFoundNoSuccessfulPublishes()
        {
            BuildTestData();

            var url = $"/api/products/{product3.Id}/files/published/apk";
            var response = await Get(url);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
