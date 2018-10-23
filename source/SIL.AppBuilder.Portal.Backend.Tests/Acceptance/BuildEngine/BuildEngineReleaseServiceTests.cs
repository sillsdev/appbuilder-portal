﻿using System;
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
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.BuildEngine
{
    [Collection("BuildEngineCollection")]
    public class BuildEngineReleaseServiceTests : BaseTest<BuildEngineStartup>
    {
        public BuildEngineReleaseServiceTests(TestFixture<BuildEngineStartup> fixture) : base(fixture)
        {
        }
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
                WorkflowJobId = 1,
                WorkflowBuildId = 2
            });
            product2 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project1.Id,
                ProductDefinitionId = productDefinition1.Id,
                StoreId = store1.Id,
                WorkflowJobId = 1,
                WorkflowBuildId = 2,
                WorkflowPublishId = 3
            });
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Release_Connection_UnavailableAsync()
        {
            BuildTestData(false);
            var buildReleaseService = _fixture.GetService<BuildEngineReleaseService>();
            var ex = await Assert.ThrowsAsync<Exception>(async () => await buildReleaseService.CreateReleaseAsync(product1.Id, "production"));
            Assert.Equal("Connection not available", ex.Message);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Release_CreateAsync()
        {
            BuildTestData();
            var buildReleaseService = _fixture.GetService<BuildEngineReleaseService>();
            var mockBuildEngine = Mock.Get(buildReleaseService.BuildEngineApi);
            var mockRecurringTaskManager = Mock.Get(buildReleaseService.RecurringJobManager);
            mockRecurringTaskManager.Reset();
            mockBuildEngine.Reset();
            var releaseResponse = new ReleaseResponse
            {
                Id = 3,
                BuildId = 2,
                Status = "initialized",
                Result = "",
                Error = ""
            };
            mockBuildEngine.Setup(x => x.CreateRelease(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<Release>())).Returns(releaseResponse);
            var release = new Release
            {
                Channel = "production"
            };
            await buildReleaseService.CreateReleaseAsync(product1.Id, "production");
            mockBuildEngine.Verify(x => x.SetEndpoint(
                It.Is<String>(u => u == org1.BuildEngineUrl),
                It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
            ));
            mockBuildEngine.Verify(x => x.CreateRelease(It.Is<int>(b => b == product1.WorkflowJobId),
                                                        It.Is<int>(b => b == product1.WorkflowBuildId),
                                                        It.Is<Release>(b => b.Channel == "production")));
            var token = "CreateReleaseMonitor" + product1.Id.ToString();
            mockRecurringTaskManager.Verify(x => x.AddOrUpdate(
                It.Is<string>(t => t == token),
                It.Is<Job>(job =>
                           job.Method.Name == "CheckRelease" &&
                           job.Type == typeof(BuildEngineReleaseService)),
                It.Is<string>(c => c == "* * * * *"),
                It.IsAny<RecurringJobOptions>()
            ));
            var products = ReadTestData<AppDbContext, Product>();
            var modifiedProduct = products.First(p => p.Id == product1.Id);
            Assert.Equal(3, modifiedProduct.WorkflowPublishId);
            Assert.Null(modifiedProduct.DatePublished);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Release_Check_ReleaseAsync()
        {
            BuildTestData();
            var buildReleaseService = _fixture.GetService<BuildEngineReleaseService>();
            var mockBuildEngine = Mock.Get(buildReleaseService.BuildEngineApi);
            mockBuildEngine.Reset();
            var releaseResponse = new ReleaseResponse
            {
                Id = 3,
                BuildId = 2,
                Status = "completed",
                Result = "SUCCESS",
                Error = ""
            };
            mockBuildEngine.Setup(x => x.GetRelease(It.IsAny<int>(),
                                                    It.IsAny<int>(),
                                                    It.IsAny<int>()))
                           .Returns(releaseResponse);
            await buildReleaseService.CheckReleaseAsync(product2.Id);
            mockBuildEngine.Verify(x => x.SetEndpoint(
                It.Is<String>(u => u == org1.BuildEngineUrl),
                It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
            ));
            mockBuildEngine.Verify(x => x.GetRelease(It.Is<int>(i => i == product2.WorkflowJobId),
                                                     It.Is<int>(b => b == product2.WorkflowBuildId),
                                                     It.Is<int>(r => r == product2.WorkflowPublishId)));
            var products = ReadTestData<AppDbContext, Product>();
            var modifiedProduct = products.First(p => p.Id == product2.Id);
            Assert.NotNull(modifiedProduct.DatePublished);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Release_Status_Unavailable()
        {
            BuildTestData();
            var buildReleaseService = _fixture.GetService<BuildEngineReleaseService>();
            var mockBuildEngine = Mock.Get(buildReleaseService.BuildEngineApi);
            mockBuildEngine.Reset();

            var status = await buildReleaseService.GetStatusAsync(product1.Id);
            Assert.Equal(BuildEngineStatus.Unavailable, status);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Release_Status_Success()
        {
            BuildTestData();
            var buildReleaseService = _fixture.GetService<BuildEngineReleaseService>();
            var mockBuildEngine = Mock.Get(buildReleaseService.BuildEngineApi);
            mockBuildEngine.Reset();
            var releaseResponse = new ReleaseResponse
            {
                Id = 3,
                BuildId = 2,
                Status = "completed",
                Result = "SUCCESS",
                Error = "",
            };

            mockBuildEngine.Setup(x => x.GetRelease(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).Returns(releaseResponse);
            var status = await buildReleaseService.GetStatusAsync(product2.Id);
            Assert.Equal(BuildEngineStatus.Success, status);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Release_Status_In_Progress()
        {
            BuildTestData();
            var buildReleaseService = _fixture.GetService<BuildEngineReleaseService>();
            var mockBuildEngine = Mock.Get(buildReleaseService.BuildEngineApi);
            mockBuildEngine.Reset();

            var releaseResponse = new ReleaseResponse
            {
                Id = 3,
                BuildId = 2,
                Status = "active",
                Result = "",
                Error = ""
            };

            mockBuildEngine.Setup(x => x.GetRelease(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).Returns(releaseResponse);
            var status = await buildReleaseService.GetStatusAsync(product2.Id);
            Assert.Equal(BuildEngineStatus.InProgress, status);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Release_Status_Failure()
        {
            BuildTestData();
            var buildReleaseService = _fixture.GetService<BuildEngineReleaseService>();
            var mockBuildEngine = Mock.Get(buildReleaseService.BuildEngineApi);
            mockBuildEngine.Reset();

            var releaseResponse = new ReleaseResponse
            {
                Id = 3,
                BuildId = 2,
                Status = "completed",
                Result = "FAILURE",
                Error = "Error"
            };

            mockBuildEngine.Setup(x => x.GetRelease(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).Returns(releaseResponse);
            var status = await buildReleaseService.GetStatusAsync(product2.Id);
            Assert.Equal(BuildEngineStatus.Failure, status);
        }

    }
}
