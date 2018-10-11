using System;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using SIL.AppBuilder.BuildEngineApiClient;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;
using Project = OptimaJet.DWKit.StarterApplication.Models.Project;
using Job = Hangfire.Common.Job;
using Hangfire;
using System.Collections.Generic;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.BuildEngine
{
    [Collection("BuildEngineCollection")]
    public class BuildEngineBuildServiceTests : BaseTest<BuildEngineStartup>
    {
        public BuildEngineBuildServiceTests(TestFixture<BuildEngineStartup> fixture) : base(fixture)
        {
        }
        // Skipping tests because getting DbUpdateConcurreyExceptions after the first couple of tests for unknown reasons
        // Each test can be run individually successfully
        const string skipAcceptanceTest = null; //"Acceptance Test disabled"; // Set to null to be able to run/debug using Unit Test Runner
        public User CurrentUser { get; set; }
        public User user1 { get; set; }
        public OrganizationMembership CurrentUserMembership { get; set; }
        public OrganizationMembership organizationMembership1 { get; set; }
        public Organization org1 { get; private set; }
        public Group group1 { get; set; }
        public GroupMembership groupMembership1 { get; set; }
        public ApplicationType type1 { get; set; }
        public Project project1 { get; set; }
        public SystemStatus systemStatus1 { get; set; }
        public ProductDefinition productDefinition1 { get; set; }
        public Product product1 { get; set; }
        public Product product2 { get; set; }
        public WorkflowDefinition workflow1 { get; set; }
        public Store store1 { get; set; }
        public ProductArtifact artifact1 { get; set; }

        private void BuildTestData(bool available = true)
        {
            CurrentUser = NeedsCurrentUser();
            user1 = AddEntity<AppDbContext, User>(new User
            {
                ExternalId = "test-auth0-id1",
                Email = "test-email1@test.test",
                Name = "Test Testenson1",
                GivenName = "Test1",
                FamilyName = "Testenson1"
            });
            org1 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg1",
                WebsiteUrl = "https://testorg1.org",
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = "replace",

            });
            CurrentUserMembership = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = CurrentUser.Id,
                OrganizationId = org1.Id
            });
            organizationMembership1 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = user1.Id,
                OrganizationId = org1.Id
            });
            group1 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup1",
                Abbreviation = "TG1",
                OwnerId = org1.Id
            });
            groupMembership1 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
            {
                UserId = user1.Id,
                GroupId = group1.Id
            });
            type1 = AddEntity<AppDbContext, ApplicationType>(new ApplicationType
            {
                Name = "scriptureappbuilder",
                Description = "Scripture App Builder"
            });
            project1 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project1",
                TypeId = type1.Id,
                Description = "Test Description",
                OwnerId = user1.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-US",
                IsPublic = true,
                WorkflowProjectUrl = "ssh://APKAIKQTCJ3JIDKLHHDA@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-DEM-LSDEV-eng-US-English-Greek"
            });
            systemStatus1 = AddEntity<AppDbContext, SystemStatus>(new SystemStatus
            {
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = "replace",
                SystemAvailable = available
            });
            store1 = AddEntity<AppDbContext, Store>(new Store
            {
                Name = "wycliffeusa",
                Description = "Wycliffe USA Google Play Store"
            });
            workflow1 = AddEntity<AppDbContext, WorkflowDefinition>(new WorkflowDefinition
            {
                Name = "TestWorkFlow",
                Enabled = true,
                Description = "This is a test workflow",
                WorkflowScheme = "Don't know what this is"
            });

            productDefinition1 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition
            {
                Name = "TestProd1",
                TypeId = type1.Id,
                Description = "This is a test product",
                WorkflowId = workflow1.Id
            });

            product1 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project1.Id,
                ProductDefinitionId = productDefinition1.Id,
                StoreId = store1.Id,
                WorkflowJobId = 1
            });
            product2 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project1.Id,
                ProductDefinitionId = productDefinition1.Id,
                StoreId = store1.Id,
                WorkflowJobId = 1,
                WorkflowBuildId = 2
            });
            //artifact1 = AddEntity<AppDbContext, ProductArtifact>(new ProductArtifact
            //{
            //    ProductId = product1.Id,
            //    ArtifactType = "about",
            //    Url = "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/1/about.txt",
            //    ContentType = "text/plain",
            //    FileSize = 1831
            //});
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Product_Not_FoundAsync()
        {
            BuildTestData();
            var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
            await buildBuildService.CreateBuildAsync(999);
            // TODO: Verify notification
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Build_Connection_UnavailableAsync()
        {
            BuildTestData(false);
            var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
            var ex = await Assert.ThrowsAsync<Exception>(async () => await buildBuildService.CreateBuildAsync(product1.Id));
            Assert.Equal("Connection not available", ex.Message);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Build_CreateAsync()
        {
            BuildTestData();
            var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
            var mockBuildEngine = Mock.Get(buildBuildService.BuildEngineApi);
            var mockRecurringTaskManager = Mock.Get(buildBuildService.RecurringJobManager);
            mockRecurringTaskManager.Reset();
            mockBuildEngine.Reset();
            var buildResponse = new BuildResponse
            {
                Id = 2,
                JobId = 1,
                Status = "initialized",
                Result = "",
                Error = ""
            };
            mockBuildEngine.Setup(x => x.CreateBuild(It.IsAny<int>())).Returns(buildResponse);
            await buildBuildService.CreateBuildAsync(product1.Id);
            mockBuildEngine.Verify(x => x.SetEndpoint(
                It.Is<String>(u => u == org1.BuildEngineUrl),
                It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
            ));
            mockBuildEngine.Verify(x => x.CreateBuild(It.Is<int>(b => b == product1.WorkflowJobId)));
            var token = "CreateBuildMonitor" + product1.Id.ToString();
            mockRecurringTaskManager.Verify(x => x.AddOrUpdate(
                It.Is<string>(t => t == token),
                It.Is<Job>(job =>
                           job.Method.Name == "CheckBuild" &&
                           job.Type == typeof(BuildEngineBuildService)),
                It.Is<string>(c => c == "* * * * *"),
                It.IsAny<RecurringJobOptions>()
            ));
            var products = ReadTestData<AppDbContext, Product>();
            var modifiedProduct = products.First(p => p.Id == product1.Id);
            Assert.Equal(2, modifiedProduct.WorkflowBuildId);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Build_Check_BuildAsync()
        {
            BuildTestData();
            var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
            var mockBuildEngine = Mock.Get(buildBuildService.BuildEngineApi);
            var mockWebRequestWrapper = Mock.Get(buildBuildService.WebRequestWrapper);
            mockBuildEngine.Reset();
            mockWebRequestWrapper.Reset();
            var modifiedArtifact1 = new ProductArtifact
            {
                ProductId = product1.Id,
                ArtifactType = "apk",
                Url = "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7.apk",
                ContentType = "application/octet-stream",
                FileSize = 8684905,
                LastModified = DateTime.UtcNow
            };
            var modifiedArtifact2 = new ProductArtifact
            {
                ProductId = product1.Id,
                ArtifactType = "about",
                Url = "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/about.txt",
                ContentType = "text/plain",
                FileSize = 1831,
                LastModified = DateTime.UtcNow
            };
            var artifacts = new Dictionary<string, string>()
            {
                {"apk", "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7.apk"},
                {"about", "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/about.txt"}
            };
            var buildResponse = new BuildResponse
            {
                Id = 2,
                JobId = 1,
                Status = "completed",
                Result = "SUCCESS",
                Error = "",
                Artifacts = artifacts
            };
            mockBuildEngine.Setup(x => x.GetBuild(It.Is<int>(i => i == product2.WorkflowJobId),
                                                  It.Is<int>(b => b == product2.WorkflowBuildId)))
                           .Returns(buildResponse);
            mockWebRequestWrapper.Setup(x => x.GetFileInfo(It.Is<ProductArtifact>(a =>
                                                                                  a.ArtifactType == "apk")))
                                 .Returns(modifiedArtifact1);
            mockWebRequestWrapper.Setup(x => x.GetFileInfo(It.Is<ProductArtifact>(a =>
                                                                                  a.ArtifactType == "about")))
                                 .Returns(modifiedArtifact2);
            await buildBuildService.CheckBuildAsync(product2.Id);
            mockBuildEngine.Verify(x => x.SetEndpoint(
                It.Is<String>(u => u == org1.BuildEngineUrl),
                It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
            ));
            var modifiedArtifacts = ReadTestData<AppDbContext, ProductArtifact>();
            Assert.Equal(2, modifiedArtifacts.Count);
            var modifiedApk = modifiedArtifacts.First(a => a.ArtifactType == modifiedArtifact1.ArtifactType);
            Assert.Equal(modifiedArtifact1.Url, modifiedApk.Url);
            Assert.Equal(modifiedArtifact1.ContentType, modifiedApk.ContentType);
            Assert.Equal(modifiedArtifact1.FileSize, modifiedApk.FileSize);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Build_Status_Unavailable()
        {
            BuildTestData();
            var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
            var mockBuildEngine = Mock.Get(buildBuildService.BuildEngineApi);
            mockBuildEngine.Reset();

            var status = await buildBuildService.GetStatusAsync(product1.Id);
            Assert.Equal(BuildEngineStatus.Unavailable, status);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Build_Status_Success()
        {
            BuildTestData();
            var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
            var mockBuildEngine = Mock.Get(buildBuildService.BuildEngineApi);
            mockBuildEngine.Reset();
            var artifacts = new Dictionary<string, string>()
            {
                {"apk", "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7.apk"},
                {"about", "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/about.txt"}
            };

            var buildResponse = new BuildResponse
            {
                Id = 2,
                JobId = 1,
                Status = "completed",
                Result = "SUCCESS",
                Error = "",
                Artifacts = artifacts
            };

            mockBuildEngine.Setup(x => x.GetBuild(It.IsAny<int>(), It.IsAny<int>())).Returns(buildResponse);
            var status = await buildBuildService.GetStatusAsync(product2.Id);
            Assert.Equal(BuildEngineStatus.Success, status);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Build_Status_In_Progress()
        {
            BuildTestData();
            var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
            var mockBuildEngine = Mock.Get(buildBuildService.BuildEngineApi);
            mockBuildEngine.Reset();

            var buildResponse = new BuildResponse
            {
                Id = 2,
                JobId = 1,
                Status = "active",
                Result = "",
                Error = ""
            };

            mockBuildEngine.Setup(x => x.GetBuild(It.IsAny<int>(), It.IsAny<int>())).Returns(buildResponse);
            var status = await buildBuildService.GetStatusAsync(product2.Id);
            Assert.Equal(BuildEngineStatus.InProgress, status);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Build_Status_Failure()
        {
            BuildTestData();
            var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
            var mockBuildEngine = Mock.Get(buildBuildService.BuildEngineApi);
            mockBuildEngine.Reset();

            var buildResponse = new BuildResponse
            {
                Id = 2,
                JobId = 1,
                Status = "completed",
                Result = "FAILURE",
                Error = "Error"
            };

            mockBuildEngine.Setup(x => x.GetBuild(It.IsAny<int>(), It.IsAny<int>())).Returns(buildResponse);
            var status = await buildBuildService.GetStatusAsync(product2.Id);
            Assert.Equal(BuildEngineStatus.Failure, status);
        }
    }
}
