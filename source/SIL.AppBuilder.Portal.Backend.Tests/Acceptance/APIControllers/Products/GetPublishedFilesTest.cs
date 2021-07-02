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
using OptimaJet.DWKit.StarterApplication.Utility;
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
        public async Task Check_Latest_Published_Apk_File_Not_Modified()
        {
            BuildTestData();
            var dateSame = DateTime.UtcNow;
            var modifiedArtifact2_1 = new ProductArtifact
            {
                ProductId = product1.Id,
                ProductBuildId = productBuild2.Id,
                ArtifactType = "apk",
                Url = "https://sil-prd-aps-artifacts.s3.amazonaws.com/prd/jobs/build_scriptureappbuilder_1/2880/test-4.7.apk",
                ContentType = "application/octet-stream",
                LastModified = dateSame
            };
            var webRequestWrapper = _fixture.GetService<WebRequestWrapper>();
            var webRequestWrapperMock = Mock.Get(webRequestWrapper);
            webRequestWrapperMock.Reset();
            webRequestWrapperMock.Setup(x => x.GetFileInfo(It.Is<ProductArtifact>(a => a.ArtifactType == "apk")))
                .Returns(modifiedArtifact2_1);

            var url = $"/api/products/{product1.Id}/files/published/apk";
            var response = await Head(url, dateSame.ToUniversalTime().ToString("r"));

            Assert.Equal(HttpStatusCode.NotModified, response.StatusCode);
        }
        [Fact]
        public async Task Check_Latest_Published_Apk_File_OK()
        {
            BuildTestData();
            var date = DateTime.UtcNow.AddMinutes(-20);
            var modifiedArtifact2_1 = new ProductArtifact
            {
                ProductId = product1.Id,
                ProductBuildId = productBuild2.Id,
                ArtifactType = "apk",
                Url = "https://sil-prd-aps-artifacts.s3.amazonaws.com/prd/jobs/build_scriptureappbuilder_1/2880/test-4.7.apk",
                ContentType = "application/octet-stream",
                LastModified = date
            };
            var webRequestWrapper = _fixture.GetService<WebRequestWrapper>();
            var webRequestWrapperMock = Mock.Get(webRequestWrapper);
            webRequestWrapperMock.Reset();
            webRequestWrapperMock.Setup(x => x.GetFileInfo(It.Is<ProductArtifact>(a => a.ArtifactType == "apk")))
                .Returns(modifiedArtifact2_1);

            var url = $"/api/products/{product1.Id}/files/published/apk";
            var response = await Head(url, DateTime.UtcNow.ToUniversalTime().ToString("r"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
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
