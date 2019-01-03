using System;
using Moq;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using Project = OptimaJet.DWKit.StarterApplication.Models.Project;
using BuildEngineJob = SIL.AppBuilder.BuildEngineApiClient.Job;
using SIL.AppBuilder.BuildEngineApiClient;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;
using System.Linq;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Repositories;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.BuildEngine
{
    [Collection("BuildEngineCollection")]
    public class BuildEngineProductServiceTests : BaseTest<BuildEngineStartup>
    {
        public BuildEngineProductServiceTests(TestFixture<BuildEngineStartup> fixture) : base(fixture)
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
        public WorkflowDefinition workflow1 { get; set; }
        public Store store1 { get; set; }
 
        private void BuildTestData()
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
                BuildEngineApiAccessToken = "replace"
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
                StoreId = store1.Id
            });
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Product_Not_FoundAsync()
        {
            BuildTestData();
            var buildProductService = _fixture.GetService<BuildEngineProductService>();
            await buildProductService.ManageProductAsync(Guid.NewGuid(), null);
            // TODO: Verify notification
        }
        [Fact (Skip = skipAcceptanceTest)]
        public async Task Create_ProductAsync()
        {
            BuildTestData();
            var buildProductService = _fixture.GetService<BuildEngineProductService>();
            var mockBuildEngine = Mock.Get(buildProductService.BuildEngineApi);

            var jobResponse = new JobResponse
            {
                Id = 5
            };
            mockBuildEngine.Reset();
            mockBuildEngine.Setup(x => x.CreateJob(It.IsAny<BuildEngineJob>())).Returns(jobResponse);
            systemStatus1.SystemAvailable = true;

            await buildProductService.ManageProductAsync(product1.Id, null);

            var products = ReadTestData<AppDbContext, Product>();
            var modifiedProduct = products.First(p => p.Id == product1.Id);
            Assert.Equal(5, modifiedProduct.WorkflowJobId);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Product_Connection_UnavailableAsync()
        {
            BuildTestData();
            var buildProductService = _fixture.GetService<BuildEngineProductService>();
            var mockBuildEngine = Mock.Get(buildProductService.BuildEngineApi);
            systemStatus1.SystemAvailable = false;
            var ex = await Assert.ThrowsAsync<Exception>(async () => await buildProductService.ManageProductAsync(product1.Id, null));
            Assert.Equal("Connection not available", ex.Message);

        }

    }

}
