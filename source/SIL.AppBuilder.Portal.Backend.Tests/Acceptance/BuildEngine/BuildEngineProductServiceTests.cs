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
using OptimaJet.DWKit.StarterApplication.Services;

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
        public User user2 { get; set; }
        public User user3 { get; set; }
        public OrganizationMembership CurrentUserMembership { get; set; }
        public OrganizationMembership organizationMembership1 { get; set; }
        public OrganizationMembership organizationMembership2 { get; set; }
        public Organization org1 { get; private set; }
        public Group group1 { get; set; }
        public GroupMembership groupMembership1 { get; set; }
        public GroupMembership groupMembership2 { get; set; }
        public ApplicationType type1 { get; set; }
        public Project project1 { get; set; }
        public SystemStatus systemStatus1 { get; set; }
        public ProductDefinition productDefinition1 { get; set; }
        public Product product1 { get; set; }
        public WorkflowDefinition workflow1 { get; set; }
        public Store store1 { get; set; }
        public Role roleOA { get; set; }
        public Role roleSA { get; set; }
        public UserRole ur1 { get; set; }
        public UserRole ur2 { get; set; }

        private void BuildTestData()
        {
            CurrentUser = NeedsCurrentUser();
            roleOA = AddEntity<AppDbContext, Role>(new Role
            {
                RoleName = RoleName.OrganizationAdmin
            });
            roleSA = AddEntity<AppDbContext, Role>(new Role
            {
                RoleName = RoleName.SuperAdmin
            });
            user1 = AddEntity<AppDbContext, User>(new User
            {
                ExternalId = "test-auth0-id1",
                Email = "test-email1@test.test",
                Name = "Test Testenson1",
                GivenName = "Test1",
                FamilyName = "Testenson1"
            });
            user2 = AddEntity<AppDbContext, User>(new User
            {
                ExternalId = "test-auth0-id2",
                Email = "test-email2@test.test",
                Name = "Test Testenson2",
                GivenName = "Test2",
                FamilyName = "Testenson2"
            });
            user3 = AddEntity<AppDbContext, User>(new User
            {
                ExternalId = "test-auth0-id3",
                Email = "test-email3@test.test",
                Name = "Test Testenson3",
                GivenName = "Test3",
                FamilyName = "Testenson3"
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
            organizationMembership2 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = user2.Id,
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
            groupMembership2 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
            {
                UserId = user2.Id,
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
            ur1 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = user2.Id,
                RoleId = roleOA.Id,
                OrganizationId = org1.Id
            });
            ur2 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = user3.Id,
                RoleId = roleSA.Id,
                OrganizationId = org1.Id
            });
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Product_Not_FoundAsync()
        {
            BuildTestData();
            var mockNotificationService = Mock.Get(SendNotificationService.HubContext);
            var buildProductService = _fixture.GetService<BuildEngineProductService>();
            var productId = Guid.NewGuid();
            await buildProductService.ManageProductAsync(productId, null);
            mockNotificationService.Verify(x => x.Clients.User(It.Is<string>(i => i == user3.ExternalId)));
            var notifications = ReadTestData<AppDbContext, Notification>();
            Assert.Single(notifications);
            var expectedJson = "{\"productId\":\"" + productId.ToString() + "\"}";
            Assert.Equal(expectedJson, notifications[0].MessageSubstitutionsJson);
            Assert.Equal("productRecordNotFound", notifications[0].MessageId);
        }
        [Fact (Skip = skipAcceptanceTest)]
        public async Task Create_ProductAsync()
        {
            BuildTestData();
            var buildProductService = _fixture.GetService<BuildEngineProductService>();
            var mockNotificationService = Mock.Get(SendNotificationService.HubContext);
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
            // One notification should be sent to owner on successful build
            mockNotificationService.Verify(x => x.Clients.User(It.Is<string>(i => i == user1.ExternalId)));
            var notifications = ReadTestData<AppDbContext, Notification>();
            Assert.Single(notifications);
            Assert.Equal("{\"projectName\":\"Test Project1\",\"productName\":\"TestProd1\"}", notifications[0].MessageSubstitutionsJson);
            Assert.Equal("productCreatedSuccessfully", notifications[0].MessageId);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Product_Connection_UnavailableAsync()
        {
            BuildTestData();
            var mockNotificationService = Mock.Get(SendNotificationService.HubContext);
            var buildProductService = _fixture.GetService<BuildEngineProductService>();
            var mockBuildEngine = Mock.Get(buildProductService.BuildEngineApi);
            systemStatus1.SystemAvailable = false;
            var ex = await Assert.ThrowsAsync<Exception>(async () => await buildProductService.ManageProductAsync(product1.Id, null));
            Assert.Equal("Connection not available", ex.Message);
            // Verify that notifications are sent to the user and the org admin
            mockNotificationService.Verify(x => x.Clients.User(It.Is<string>(i => i == user1.ExternalId)));
            mockNotificationService.Verify(x => x.Clients.User(It.Is<string>(i => i == user2.ExternalId)));
            var notifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, notifications.Count);
            Assert.Equal("{\"projectName\":\"Test Project1\",\"productName\":\"TestProd1\"}", notifications[0].MessageSubstitutionsJson);
            Assert.Equal("productFailedUnableToConnect", notifications[0].MessageId);

        }

    }

}
