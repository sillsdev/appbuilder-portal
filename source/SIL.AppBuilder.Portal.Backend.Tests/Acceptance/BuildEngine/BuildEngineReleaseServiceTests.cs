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
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler;
using Microsoft.AspNetCore.SignalR;
using OptimaJet.DWKit.StarterApplication.Utility;

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
        public User user2 { get; set; }
        public User user3 { get; set; }
        public OrganizationMembership CurrentUserMembership { get; set; }
        public OrganizationMembership organizationMembership1 { get; set; }
        public OrganizationMembership organizationMembership2 { get; set; }
        public OrganizationMembership organizationMembership3 { get; set; }
        public OrganizationMembership organizationMembership4 { get; set; }
        public Organization org1 { get; private set; }
        public Organization org2 { get; private set; }
        public Group group1 { get; set; }
        public Group group2 { get; set; }
        public GroupMembership groupMembership1 { get; set; }
        public GroupMembership groupMembership2 { get; set; }
        public GroupMembership groupMembership3 { get; set; }
        public GroupMembership groupMembership4 { get; set; }
        public ApplicationType type1 { get; set; }
        public Project project1 { get; set; }
        public Project project2 { get; set; }
        public SystemStatus systemStatus1 { get; set; }
        public SystemStatus systemStatus2 { get; set; }
        public ProductDefinition productDefinition1 { get; set; }
        public Product product1 { get; set; }
        public Product product2 { get; set; }
        public Product product3 { get; set; }
        public WorkflowDefinition workflow1 { get; set; }
        public Store store1 { get; set; }
        public ProductArtifact artifact1 { get; set; }
        public Role roleOA { get; set; }
        public Role roleSA { get; set; }
        public UserRole ur1 { get; set; }
        public UserRole ur2 { get; set; }
        public UserRole ur3 { get; set; }

        private void BuildTestData(bool available = true)
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
            Environment.SetEnvironmentVariable("DEFAULT_BUILDENGINE_URL", "https://buildengine.testorg2");
            Environment.SetEnvironmentVariable("DEFAULT_BUILDENGINE_API_ACCESS_TOKEN", "ReplaceAll");
            org1 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg1",
                WebsiteUrl = "https://testorg1.org",
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = "replace",
                UseDefaultBuildEngine = false
            });
            org2 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg1",
                WebsiteUrl = "https://testorg1.org",
                UseDefaultBuildEngine = true
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
            organizationMembership3 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = user2.Id,
                OrganizationId = org2.Id
            });
            organizationMembership4 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = user1.Id,
                OrganizationId = org2.Id
            });
            group1 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup1",
                Abbreviation = "TG1",
                OwnerId = org1.Id
            });
            group2 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup2",
                Abbreviation = "TG2",
                OwnerId = org2.Id
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
            groupMembership3 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
            {
                UserId = user2.Id,
                GroupId = group2.Id
            });
            groupMembership4 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
            {
                UserId = user1.Id,
                GroupId = group2.Id
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
                WorkflowProjectUrl = "ssh://APKAIKQTCJ3JIDKLHHDA@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-DEM-LSDEV-eng-US-English-Greek",
                WorkflowAppProjectUrl = "https://dev.scriptoria.io/projects/1"
            });
            project2 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project2",
                TypeId = type1.Id,
                Description = "Test Description 2",
                OwnerId = user1.Id,
                GroupId = group2.Id,
                OrganizationId = org2.Id,
                Language = "eng-US",
                IsPublic = true,
                WorkflowProjectUrl = "ssh://APKAIKQTCJ3JIDKLHHDA@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-DEM-LSDEV-eng-US-English-Greek",
                WorkflowAppProjectUrl = "https://dev.scriptoria.io/projects/2"
            });
            systemStatus1 = AddEntity<AppDbContext, SystemStatus>(new SystemStatus
            {
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = "replace",
                SystemAvailable = available
            });
            systemStatus2 = AddEntity<AppDbContext, SystemStatus>(new SystemStatus
            {
                BuildEngineUrl = "https://buildengine.testorg2",
                BuildEngineApiAccessToken = "ReplaceAll",
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
            product3 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project2.Id,
                ProductDefinitionId = productDefinition1.Id,
                StoreId = store1.Id,
                WorkflowJobId = 1,
                WorkflowBuildId = 2,
                WorkflowPublishId = 3
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
            ur3 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = user2.Id,
                RoleId = roleOA.Id,
                OrganizationId = org2.Id
            });
        }

        private (Mock<IEntityHookHandler<Notification, int>> handler, Mock<IHubContext<JSONAPIHub>>) MockServices() 
        {
            
            var handler = _fixture.GetService<IEntityHookHandler<Notification, int>>();
            var hubContext = _fixture.GetService<IHubContext<JSONAPIHub>>();
            var mockHub = Mock.Get(hubContext);
            var mockHandler = Mock.Get(handler);

            mockHub.Reset();
            mockHandler.Reset();

            var mockClients = Mock.Get<IHubClients>(hubContext.Clients);
            mockClients.Reset();


            return (mockHandler, mockHub);
        }


        [Fact(Skip = skipAcceptanceTest)]
        public async Task Release_Connection_UnavailableAsync()
        {
            BuildTestData(false);
            var buildReleaseService = _fixture.GetService<BuildEngineReleaseService>();
            var hookHandler = _fixture.GetService<IEntityHookHandler<Notification, int>>();

            Assert.Empty(ReadTestData<AppDbContext, Notification>());

            var paramsDictionary = new Dictionary<string, object>
            {
                {"targets", "google-play" },
                {"channel", "production"}
            };
            var ex = await Assert.ThrowsAsync<Exception>(async () => await buildReleaseService.CreateReleaseAsync(product1.Id, paramsDictionary, null));
            Assert.Equal("Connection not available", ex.Message);

            // Verify that notifications are sent to the user and the org admin
            var notifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, notifications.Count);
    
            var userIds = notifications.Select(n => n.UserId);
            Assert.Contains(user1.Id, userIds);
            Assert.Contains(user2.Id, userIds);
            
            Assert.Equal("{\"projectName\":\"Test Project1\",\"productName\":\"TestProd1\"}", notifications[0].MessageSubstitutionsJson);
            Assert.Equal("releaseFailedUnableToConnect", notifications[0].MessageId);
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

            var build = AddEntity<AppDbContext, ProductBuild>(new ProductBuild
            {
                ProductId = product2.Id,
                BuildId = 2,
            });
            var releaseResponse = new ReleaseResponse
            {
                Id = 3,
                BuildId = 2,
                Status = "initialized",
                Result = "",
                Error = ""
            };
            mockBuildEngine.Setup(x => x.CreateRelease(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<Release>())).Returns(releaseResponse);
            var paramsDictionary = new Dictionary<string, object>
            {
                {"targets", "google-play" },
                {"channel", "production"}
            };

            await buildReleaseService.CreateReleaseAsync(product1.Id, paramsDictionary, null);
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
            var productPublishes = ReadTestData<AppDbContext, ProductPublication>();
            Assert.Single(productPublishes);
            var publish = productPublishes.First();
            Assert.Equal(3, publish.ReleaseId);
            Assert.Equal(build.Id, publish.ProductBuildId);
            Assert.Equal("production", publish.Channel);
            var notifications = ReadTestData<AppDbContext, Notification>();
            Assert.Empty(notifications);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Release_Check_ReleaseAsync()
        {
            BuildTestData();
            var buildReleaseService = _fixture.GetService<BuildEngineReleaseService>();

            var mockBuildEngine = Mock.Get(buildReleaseService.BuildEngineApi);
            var mockWebClient = Mock.Get(buildReleaseService.WebClient);
            mockBuildEngine.Reset();
            mockWebClient.Reset();


            Assert.Empty(ReadTestData<AppDbContext, Notification>());

            var productBuild = AddEntity<AppDbContext, ProductBuild>(new ProductBuild
            {
                ProductId = product2.Id,
                BuildId = 2,
            });
            var productRelease = AddEntity<AppDbContext, ProductPublication>(new ProductPublication
            {
                ProductId = product2.Id,
                ProductBuildId = productBuild.Id,
                ReleaseId = 3
            });
            var consoleText = "https://dem-aps-artifacts.s3.amazonaws.com/dem/jobs/publish_scriptureappbuilder_2/17/console.log";
            var publishUrl = "https://dem-aps-artifacts.s3.amazonaws.com/dem/jobs/publish_scriptureappbuilder_2/17/publish_url.txt";
            var publishUrlContents = "https://google.play/path/to/app";
            var releaseResponse = new ReleaseResponse
            {
                Id = 3,
                BuildId = 2,
                Status = "completed",
                Result = "SUCCESS",
                Error = "",
                Artifacts = new Dictionary<string, string> { { "publishUrl", publishUrl }, { "consoleText", consoleText} },
                ConsoleText = consoleText
            };
            mockBuildEngine.Setup(x => x.GetRelease(It.IsAny<int>(),
                                                    It.IsAny<int>(),
                                                    It.IsAny<int>()))
                           .Returns(releaseResponse);
            mockWebClient.Setup(x => x.DownloadString(It.Is<string>(addr => addr == publishUrl)))
                .Returns(publishUrlContents);

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
            var modifiedProductPublications = ReadTestData<AppDbContext, ProductPublication>();
            Assert.Single(modifiedProductPublications);
            var publication = modifiedProductPublications.First();
            Assert.True(publication.Success.HasValue && publication.Success.Value);
            Assert.Equal(consoleText, publication.LogUrl);
            Assert.Equal(publishUrlContents, modifiedProduct.PublishLink);
            // One notification should be sent to owner on successful build
            var notifications = ReadTestData<AppDbContext, Notification>();
            Assert.Single(notifications);
    
            var userIds = notifications.Select(n => n.UserId);
            Assert.Contains(user1.Id, userIds);

            Assert.Equal("{\"projectName\":\"Test Project1\",\"productName\":\"TestProd1\"}", notifications[0].MessageSubstitutionsJson);
            Assert.Equal("releaseCompletedSuccessfully", notifications[0].MessageId);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Release_Check_Failure()
        {
            BuildTestData();
            var buildReleaseService = _fixture.GetService<BuildEngineReleaseService>();
            Assert.Empty(ReadTestData<AppDbContext, Notification>());

            var mockBuildEngine = Mock.Get(buildReleaseService.BuildEngineApi);
            mockBuildEngine.Reset();

            var productBuild = AddEntity<AppDbContext, ProductBuild>(new ProductBuild
            {
                ProductId = product2.Id,
                BuildId = 2,
            });
            var productRelease = AddEntity<AppDbContext, ProductPublication>(new ProductPublication
            {
                ProductId = product2.Id,
                ProductBuildId = productBuild.Id,
                ReleaseId = 3
            });

            var releaseResponse = new ReleaseResponse
            {
                Id = 3,
                BuildId = 2,
                Status = "completed",
                Result = "FAILURE",
                Error = "Error",
                ConsoleText = "https://dem-aps-artifacts.s3.amazonaws.com/dem/jobs/publish_scriptureappbuilder_2/17/console.log"
            };

            mockBuildEngine.Setup(x => x.GetRelease(It.IsAny<int>(),
                                                    It.IsAny<int>(),
                                                    It.IsAny<int>()))
                           .Returns(releaseResponse);
            await buildReleaseService.CheckReleaseAsync(product2.Id);
            // Verify that notifications are sent to the user and the org admin
            var notifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, notifications.Count);
    
            var userIds = notifications.Select(n => n.UserId);
            Assert.Contains(user1.Id, userIds);
            Assert.Contains(user2.Id, userIds);
            Assert.Equal($"{{\"projectName\":\"Test Project1\",\"productName\":\"TestProd1\",\"releaseStatus\":\"completed\",\"releaseError\":\"Error\",\"buildEngineUrl\":\"https://buildengine.testorg1/release-admin/view?id=3\",\"consoleTextUrl\":\"https://dem-aps-artifacts.s3.amazonaws.com/dem/jobs/publish_scriptureappbuilder_2/17/console.log\",\"jobId\":{product2.WorkflowJobId},\"buildId\":{product2.WorkflowBuildId},\"publishId\":{product2.WorkflowPublishId},\"projectId\":{product2.Project.Id},\"projectUrl\":\"https://dev.scriptoria.io/projects/1\"}}", notifications[0].MessageSubstitutionsJson);
            Assert.Equal("releaseFailedAdmin", notifications[0].MessageId);
            Assert.Equal(releaseResponse.ConsoleText, notifications[0].LinkUrl);
            var modifiedProductPublishes = ReadTestData<AppDbContext, ProductPublication>();
            Assert.Single(modifiedProductPublishes);
            var publish = modifiedProductPublishes.First();
            Assert.True(publish.Success.HasValue);
            Assert.False(publish.Success.Value);
            Assert.Equal(releaseResponse.ConsoleText, publish.LogUrl);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Release_Check_Failure_With_Default_Build_Engine()
        {
            BuildTestData();
            var buildReleaseService = _fixture.GetService<BuildEngineReleaseService>();
            Assert.Empty(ReadTestData<AppDbContext, Notification>());

            var mockBuildEngine = Mock.Get(buildReleaseService.BuildEngineApi);
            mockBuildEngine.Reset();

            var productBuild = AddEntity<AppDbContext, ProductBuild>(new ProductBuild
            {
                ProductId = product3.Id,
                BuildId = 2,
            });
            var productRelease = AddEntity<AppDbContext, ProductPublication>(new ProductPublication
            {
                ProductId = product3.Id,
                ProductBuildId = productBuild.Id,
                ReleaseId = 3
            });

            var releaseResponse = new ReleaseResponse
            {
                Id = 3,
                BuildId = 2,
                Status = "completed",
                Result = "FAILURE",
                Error = "Error",
                ConsoleText = "https://dem-aps-artifacts.s3.amazonaws.com/dem/jobs/publish_scriptureappbuilder_2/17/console.log"
            };

            mockBuildEngine.Setup(x => x.GetRelease(It.IsAny<int>(),
                                                    It.IsAny<int>(),
                                                    It.IsAny<int>()))
                           .Returns(releaseResponse);
            await buildReleaseService.CheckReleaseAsync(product3.Id);
            // Verify that notifications are sent to the user and the org admin
            var notifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, notifications.Count);

            var userIds = notifications.Select(n => n.UserId);
            Assert.Contains(user1.Id, userIds);
            Assert.Contains(user2.Id, userIds);
            Assert.Equal($"{{\"projectName\":\"Test Project2\",\"productName\":\"TestProd1\",\"releaseStatus\":\"completed\",\"releaseError\":\"Error\",\"buildEngineUrl\":\"https://buildengine.testorg2/release-admin/view?id=3\",\"consoleTextUrl\":\"https://dem-aps-artifacts.s3.amazonaws.com/dem/jobs/publish_scriptureappbuilder_2/17/console.log\",\"jobId\":{product3.WorkflowJobId},\"buildId\":{product3.WorkflowBuildId},\"publishId\":{product3.WorkflowPublishId},\"projectId\":{product3.Project.Id},\"projectUrl\":\"https://dev.scriptoria.io/projects/2\"}}", notifications[0].MessageSubstitutionsJson);
            Assert.Equal("releaseFailedAdmin", notifications[0].MessageId);
            Assert.Equal(releaseResponse.ConsoleText, notifications[0].LinkUrl);
            var modifiedProductPublishes = ReadTestData<AppDbContext, ProductPublication>();
            Assert.Single(modifiedProductPublishes);
            var publish = modifiedProductPublishes.First();
            Assert.True(publish.Success.HasValue);
            Assert.False(publish.Success.Value);
            Assert.Equal(releaseResponse.ConsoleText, publish.LogUrl);
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
                Error = "Error",
                ConsoleText = "https://dem-aps-artifacts.s3.amazonaws.com/dem/jobs/build_scriptureappbuilder_3/3/console.log"
            };

            mockBuildEngine.Setup(x => x.GetRelease(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).Returns(releaseResponse);
            var status = await buildReleaseService.GetStatusAsync(product2.Id);
            Assert.Equal(BuildEngineStatus.Failure, status);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Release_Get_ConsoleText()
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
                Error = "Error",
                ConsoleText = "https://dem-aps-artifacts.s3.amazonaws.com/dem/jobs/build_scriptureappbuilder_3/3/console.log"
            };

            mockBuildEngine.Setup(x => x.GetRelease(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).Returns(releaseResponse);
            var consoleText = await buildReleaseService.GetConsoleText(product2.Id);
            Assert.Equal("https://dem-aps-artifacts.s3.amazonaws.com/dem/jobs/build_scriptureappbuilder_3/3/console.log", consoleText);
        }
    }
}
