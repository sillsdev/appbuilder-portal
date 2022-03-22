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

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.BuildEngine
{
    [Collection("BuildEngineCollection")]
     public class BuildEngineBuildServiceTests : BaseTest<BuildEngineStartup>
     {
         public BuildEngineBuildServiceTests(TestFixture<BuildEngineStartup> fixture) : base(fixture)
         {
         }
         const string skipAcceptanceTest = null; //"Acceptance Test disabled"; // Set to null to be able to run/debug using Unit Test Runner
         const string uiUrl = "https://app.scriptoria.test";
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
             Environment.SetEnvironmentVariable("UI_URL", uiUrl);
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
                Name = "TestOrg2",
                WebsiteUrl = "https://testorg2.org",
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
                 WorkflowJobId = 1
             });
             product2 = AddEntity<AppDbContext, Product>(new Product
             {
                 ProjectId = project1.Id,
                 ProductDefinitionId = productDefinition1.Id,
                 StoreId = store1.Id,
                 WorkflowJobId = 2,
                 WorkflowBuildId = 2
             });
             product3 = AddEntity<AppDbContext, Product>(new Product
             {
                 ProjectId = project2.Id,
                 ProductDefinitionId = productDefinition1.Id,
                 StoreId = store1.Id,
                 WorkflowJobId = 2,
                 WorkflowBuildId = 2
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
         [Fact(Skip = skipAcceptanceTest)]
         public async Task Product_Not_FoundAsync()
         {
             BuildTestData();
             var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
             var productId = Guid.NewGuid();
             var parmsDictionary = new Dictionary<string, object>
             {
                 {"targets", "apk play-listing" }
             };
             await buildBuildService.CreateBuildAsync(productId, parmsDictionary, null);
             var notifications = ReadTestData<AppDbContext, Notification>();
             Assert.Single(notifications);
             var expectedJson = "{\"productId\":\"" + productId.ToString() + "\"}";
             Assert.Equal(expectedJson, notifications[0].MessageSubstitutionsJson);
             Assert.Equal("buildProductRecordNotFound", notifications[0].MessageId);
         }
         [Fact(Skip = skipAcceptanceTest)]
         public async Task Build_Connection_UnavailableAsync()
         {
             BuildTestData(false);
             var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
             var parmsDictionary = new Dictionary<string, object>
             {
                 {"targets", "apk play-listing" }
             };
             var ex = await Assert.ThrowsAsync<Exception>(async () => await buildBuildService.CreateBuildAsync(product1.Id, parmsDictionary, null));
             Assert.Equal("Connection not available", ex.Message);
             var notifications = ReadTestData<AppDbContext, Notification>();
             Assert.Equal(2, notifications.Count);
             Assert.Equal("{\"projectName\":\"Test Project1\",\"productName\":\"TestProd1\"}", notifications[0].MessageSubstitutionsJson);
             Assert.Equal("buildFailedUnableToConnect", notifications[0].MessageId);
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
             var parmsDictionary = new Dictionary<string, object>
             {
                 {"targets", "apk play-listing" }
             };
             mockBuildEngine.Setup(x => x.CreateBuild(It.IsAny<int>(), It.IsAny<Build>())).Returns(buildResponse);
             await buildBuildService.CreateBuildAsync(product1.Id, parmsDictionary, null);
             mockBuildEngine.Verify(x => x.SetEndpoint(
                 It.Is<String>(u => u == org1.BuildEngineUrl),
                 It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
             ));
             mockBuildEngine.Verify(x => x.CreateBuild(It.Is<int>(b => b == product1.WorkflowJobId), It.IsAny<Build>()));
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
             var productBuilds = ReadTestData<AppDbContext, ProductBuild>();
            Assert.Single(productBuilds);
            var build = productBuilds.First();
            Assert.Equal(2, build.BuildId);
            Assert.Null(build.Success);
            Assert.Null(build.Version);
             Assert.Equal(2, modifiedProduct.WorkflowBuildId);
             var notifications = ReadTestData<AppDbContext, Notification>();
             Assert.Empty(notifications);
         }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Build_CreateAsync_Environment()
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
            var parmsDictionary = new Dictionary<string, object>
            {
                 {"targets", "apk play-listing" }
            };
            var projectUrl = uiUrl + "/projects/" + product1.ProjectId;
            mockBuildEngine.Setup(x => x.CreateBuild(It.IsAny<int>(), It.IsAny<Build>())).Returns(buildResponse);
            await buildBuildService.CreateBuildAsync(product1.Id, parmsDictionary, null);
            mockBuildEngine.Verify(x => x.CreateBuild(
                It.Is<int>(b => b == product1.WorkflowJobId),
                It.Is<Build>(b =>
                    checkEnv(b, "UI_URL", uiUrl) &&
                    checkEnv(b, "PRODUCT_ID", product1.Id.ToString()) &&
                    checkEnv(b, "PROJECT_ID", product1.ProjectId.ToString()) &&
                    checkEnv(b, "PROJECT_NAME", product1.Project.Name) &&
                    checkEnv(b, "PROJECT_DESCRIPTION", product1.Project.Description) &&
                    checkEnv(b, "PROJECT_URL", projectUrl) &&
                    checkEnv(b, "PROJECT_LANGUAGE", product1.Project.Language) &&
                    checkEnv(b, "PROJECT_ORGANIZATION", product1.Project.Organization.Name) &&
                    checkEnv(b, "PROJECT_OWNER_NAME", product1.Project.Owner.Name) &&
                    checkEnv(b, "PROJECT_OWNER_EMAIL", product1.Project.Owner.Email) &&
                    b.Targets.CompareTo(parmsDictionary["targets"]) == 0
                )
            ));
        }
        private bool checkEnv(Build build, String name, String value)
        {
            return build.Environment.ContainsKey(name) && build.Environment[name].CompareTo(value) == 0;
        }
        [Fact(Skip = skipAcceptanceTest)]
         public async Task Build_Check_BuildAsync()
         {
             BuildTestData();
             var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
             var mockBuildEngine = Mock.Get(buildBuildService.BuildEngineApi);
             var mockWebRequestWrapper = Mock.Get(buildBuildService.WebRequestWrapper);
             var mockWebClient = Mock.Get(buildBuildService.WebClient);
             mockBuildEngine.Reset();
             mockWebRequestWrapper.Reset();
             mockWebClient.Reset();
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
             var modifiedArtifact3 = new ProductArtifact
             {
                 ProductId = product1.Id,
                 ArtifactType = "version",
                 Url = "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/version.json",
                 ContentType = "application/json",
                 FileSize = 1831,
                 LastModified = DateTime.UtcNow
             };
             var modifiedArtifact4 = new ProductArtifact
             {
                 ProductId = product1.Id,
                 ArtifactType = "play-listing-manifest",
                 Url = "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/play-listing/manifest.json",
                 ContentType = "application/json",
                 FileSize = 1831,
                 LastModified = DateTime.UtcNow
             };
             var storetype = AddEntity<AppDbContext, StoreType>(new StoreType
             {
                 Id = 1,
                 Name = "google_play_store",
                 Description = "Google Play Store"
             });
             var language = AddEntity<AppDbContext, StoreLanguage>(new StoreLanguage
             {
                 Id = 1,
                 Name = "en-US",
                 Description = "English (United States) – en-US",
                 StoreTypeId = 1
             });

             var artifacts = new Dictionary<string, string>()
             {
                 {"apk", "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7.apk"},
                 {"about", "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/about.txt"},
                 {"version", "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/version.json"},
                 {"play-listing-manifest", "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/play-listing/manifest.json"}
             };
             product2.WorkflowBuildId = 42;

             var productBuild = AddEntity<AppDbContext, ProductBuild>(new ProductBuild
             {
                 ProductId = product2.Id,
                 BuildId = 42,
             });

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
             mockWebRequestWrapper.Setup(x => x.GetFileInfo(It.Is<ProductArtifact>(a =>
                                                                                   a.ArtifactType == "version")))
                                  .Returns(modifiedArtifact3);
             mockWebRequestWrapper.Setup(x => x.GetFileInfo(It.Is<ProductArtifact>(a =>
                                                                                   a.ArtifactType == "play-listing-manifest")))
                                  .Returns(modifiedArtifact4);

             mockWebClient.Setup(x => x.DownloadString(It.Is<string>(addr => addr == modifiedArtifact3.Url)))
                 .Returns("{ \"version\" : \"4.7.6\", \"versionName\" : \"4.7\", \"versionCode\" : \"6\" } ");
             mockWebClient.Setup(x => x.DownloadString(It.Is<string>(addr => addr == modifiedArtifact4.Url)))
                 .Returns("{ \"default-language\" : \"en-US\" }");
             await buildBuildService.CheckBuildAsync(product2.Id);
             mockBuildEngine.Verify(x => x.SetEndpoint(
                 It.Is<String>(u => u == org1.BuildEngineUrl),
                 It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
             ));
             var modifiedArtifacts = ReadTestData<AppDbContext, ProductArtifact>();
             Assert.Equal(4, modifiedArtifacts.Count);
             var modifiedApk = modifiedArtifacts.First(a => a.ArtifactType == modifiedArtifact1.ArtifactType);
             Assert.Equal(modifiedArtifact1.Url, modifiedApk.Url);
             Assert.Equal(modifiedArtifact1.ContentType, modifiedApk.ContentType);
             Assert.Equal(modifiedArtifact1.FileSize, modifiedApk.FileSize);
             var modifiedProductBuilds = ReadTestData<AppDbContext, ProductBuild>();
             Assert.Single(modifiedProductBuilds);
             var build = modifiedProductBuilds.First();
             Assert.Equal("4.7.6", build.Version);
             Assert.True(build.Success);
             var modifiedProduct = ReadTestData<AppDbContext, Product>().Where(p => p.Id == product2.Id);
             Assert.Single(modifiedProduct);
             var product = modifiedProduct.First();
             Assert.Equal("en-US", product.StoreLanguage.Name);
             Assert.Equal("4.7.6", product.VersionBuilt);
             // One notification should be sent to owner on successful build
             var notifications = ReadTestData<AppDbContext, Notification>();
             Assert.Single(notifications);
             Assert.Equal("{\"projectName\":\"Test Project1\",\"productName\":\"TestProd1\"}", notifications[0].MessageSubstitutionsJson);
             Assert.Equal("buildCompletedSuccessfully", notifications[0].MessageId);
         }
         [Fact(Skip = skipAcceptanceTest)]
         public async Task Get_Build_Check_Failure()
         {
            BuildTestData();
            var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
            var mockBuildEngine = Mock.Get(buildBuildService.BuildEngineApi);
            var mockWebRequestWrapper = Mock.Get(buildBuildService.WebRequestWrapper);
            var mockWebClient = Mock.Get(buildBuildService.WebClient);
            mockBuildEngine.Reset();
            mockWebRequestWrapper.Reset();
            mockWebClient.Reset();

            var productBuild = AddEntity<AppDbContext, ProductBuild>(new ProductBuild
            {
                ProductId = product2.Id,
                BuildId = product2.WorkflowBuildId
            });
            var buildResponse = new BuildResponse
            {
                Id = 2,
                JobId = 1,
                Status = "completed",
                Result = "FAILURE",
                Error = "Error",
                Artifacts = new Dictionary<string, string>() { { "consoleText", "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7-output.log" } }
            };
            var modifiedArtifact1 = new ProductArtifact
            {
                ProductId = product2.Id,
                ArtifactType = "consoleText",
                Url = "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7-output.log",
                ContentType = "text/plain",
                FileSize = 1831,
                LastModified = DateTime.UtcNow
            };


            mockBuildEngine.Setup(x => x.GetBuild(It.IsAny<int>(), It.IsAny<int>())).Returns(buildResponse);

            mockWebRequestWrapper.Setup(x => x.GetFileInfo(It.Is<ProductArtifact>(a =>
                                                                      a.ArtifactType == "consoleText")))
                     .Returns(modifiedArtifact1);

            await buildBuildService.CheckBuildAsync(product2.Id);
            var builds = ReadTestData<AppDbContext, ProductBuild>();
            Assert.Single(builds);
            var modifiedProductBuild = builds.FirstOrDefault();
            Assert.False(modifiedProductBuild.Success);

            // Verify that notifications are sent to the user and the org admin
            var notifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, notifications.Count);
            Assert.Equal($"{{\"projectName\":\"Test Project1\",\"productName\":\"TestProd1\",\"buildStatus\":\"completed\",\"buildError\":\"Error\",\"buildEngineUrl\":\"https://buildengine.testorg1/build-admin/view?id=2\",\"consoleText\":\"https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7-output.log\",\"projectId\":{product2.ProjectId},\"jobId\":2,\"buildId\":2,\"projectUrl\":\"https://dev.scriptoria.io/projects/1\"}}", notifications[0].MessageSubstitutionsJson);
            Assert.Equal("buildFailedAdmin", notifications[0].MessageId);
            Assert.Equal("https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7-output.log", notifications[0].LinkUrl);
         }
         [Fact(Skip = skipAcceptanceTest)]
         public async Task Get_Build_Get_ConsoleText()
         {
            BuildTestData();
            var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
            var mockBuildEngine = Mock.Get(buildBuildService.BuildEngineApi);
            var mockWebRequestWrapper = Mock.Get(buildBuildService.WebRequestWrapper);
            var mockWebClient = Mock.Get(buildBuildService.WebClient);
            mockBuildEngine.Reset();
            mockWebRequestWrapper.Reset();
            mockWebClient.Reset();

            var productBuild = AddEntity<AppDbContext, ProductBuild>(new ProductBuild
            {
                ProductId = product2.Id,
                BuildId = product2.WorkflowBuildId
            });
            var buildResponse = new BuildResponse
            {
                Id = 2,
                JobId = 1,
                Status = "completed",
                Result = "FAILURE",
                Error = "Error",
                Artifacts = new Dictionary<string, string>() { { "consoleText", "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7-output.log" } }
            };
            var modifiedArtifact1 = new ProductArtifact
            {
                ProductId = product2.Id,
                ArtifactType = "consoleText",
                Url = "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7-output.log",
                ContentType = "text/plain",
                FileSize = 1831,
                LastModified = DateTime.UtcNow
            };


            mockBuildEngine.Setup(x => x.GetBuild(It.IsAny<int>(), It.IsAny<int>())).Returns(buildResponse);

            mockWebRequestWrapper.Setup(x => x.GetFileInfo(It.Is<ProductArtifact>(a =>
                                                                      a.ArtifactType == "consoleText")))
                     .Returns(modifiedArtifact1);

            var consoleText = await buildBuildService.GetConsoleText(product2.Id);
            Assert.Equal("https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7-output.log", consoleText);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Build_Check_Failure_Default_Build_Engine()
        {
            BuildTestData();
            var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
            var mockBuildEngine = Mock.Get(buildBuildService.BuildEngineApi);
            var mockWebRequestWrapper = Mock.Get(buildBuildService.WebRequestWrapper);
            var mockWebClient = Mock.Get(buildBuildService.WebClient);
            mockBuildEngine.Reset();
            mockWebRequestWrapper.Reset();
            mockWebClient.Reset();

            var productBuild = AddEntity<AppDbContext, ProductBuild>(new ProductBuild
            {
                ProductId = product3.Id,
                BuildId = product3.WorkflowBuildId
            });
            var buildResponse = new BuildResponse
            {
                Id = 2,
                JobId = 1,
                Status = "completed",
                Result = "FAILURE",
                Error = "Error",
                Artifacts = new Dictionary<string, string>() { { "consoleText", "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7-output.log" } }
            };
            var modifiedArtifact1 = new ProductArtifact
            {
                ProductId = product3.Id,
                ArtifactType = "consoleText",
                Url = "https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7-output.log",
                ContentType = "text/plain",
                FileSize = 1831,
                LastModified = DateTime.UtcNow
            };


            mockBuildEngine.Setup(x => x.GetBuild(It.IsAny<int>(), It.IsAny<int>())).Returns(buildResponse);

            mockWebRequestWrapper.Setup(x => x.GetFileInfo(It.Is<ProductArtifact>(a =>
                                                                      a.ArtifactType == "consoleText")))
                     .Returns(modifiedArtifact1);

            await buildBuildService.CheckBuildAsync(product3.Id);
            var builds = ReadTestData<AppDbContext, ProductBuild>();
            Assert.Single(builds);
            var modifiedProductBuild = builds.FirstOrDefault();
            Assert.False(modifiedProductBuild.Success);

            // Verify that notifications are sent to the user and the org admin
            var notifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, notifications.Count);
            Assert.Equal($"{{\"projectName\":\"Test Project2\",\"productName\":\"TestProd1\",\"buildStatus\":\"completed\",\"buildError\":\"Error\",\"buildEngineUrl\":\"https://buildengine.testorg2/build-admin/view?id=2\",\"consoleText\":\"https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7-output.log\",\"projectId\":{product3.ProjectId},\"jobId\":2,\"buildId\":2,\"projectUrl\":\"https://dev.scriptoria.io/projects/2\"}}", notifications[0].MessageSubstitutionsJson);
            Assert.Equal("buildFailedAdmin", notifications[0].MessageId);
            Assert.Equal("https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_1/2/English_Greek-4.7-output.log", notifications[0].LinkUrl);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Build_Check_Failure_Missing_ConsoleLog_Default_Build_Engine()
        {
            BuildTestData();
            var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
            var mockBuildEngine = Mock.Get(buildBuildService.BuildEngineApi);
            var mockWebRequestWrapper = Mock.Get(buildBuildService.WebRequestWrapper);
            var mockWebClient = Mock.Get(buildBuildService.WebClient);
            mockBuildEngine.Reset();
            mockWebRequestWrapper.Reset();
            mockWebClient.Reset();

            var productBuild = AddEntity<AppDbContext, ProductBuild>(new ProductBuild
            {
                ProductId = product3.Id,
                BuildId = product3.WorkflowBuildId
            });
            var buildResponse = new BuildResponse
            {
                Id = 2,
                JobId = 1,
                Status = "completed",
                Result = "FAILURE",
                Error = "Error",
                Artifacts = new Dictionary<string, string>() { { "cloudWatch", "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logEvent:group=/aws/codebuild/build_app-cth;stream=25de05b1-3a4c-4b5f-a423-e706348d9622" } }
            };
            var modifiedArtifact1 = new ProductArtifact
            {
                ProductId = product3.Id,
                ArtifactType = "cloudWatch",
                Url = "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logEvent:group=/aws/codebuild/build_app-cth;stream=25de05b1-3a4c-4b5f-a423-e706348d9622",
                LastModified = DateTime.UtcNow
            };


            mockBuildEngine.Setup(x => x.GetBuild(It.IsAny<int>(), It.IsAny<int>())).Returns(buildResponse);

            mockWebRequestWrapper.Setup(x => x.GetFileInfo(It.Is<ProductArtifact>(a =>
                                                                      a.ArtifactType == "cloudWatch")))
                     .Returns(modifiedArtifact1);

            await buildBuildService.CheckBuildAsync(product3.Id);
            var builds = ReadTestData<AppDbContext, ProductBuild>();
            Assert.Single(builds);
            var modifiedProductBuild = builds.FirstOrDefault();
            Assert.False(modifiedProductBuild.Success);

            // Verify that notifications are sent to the user and the org admin
            var notifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, notifications.Count);
            Assert.Equal($"{{\"projectName\":\"Test Project2\",\"productName\":\"TestProd1\",\"buildStatus\":\"completed\",\"buildError\":\"Error\",\"buildEngineUrl\":\"https://buildengine.testorg2/build-admin/view?id=2\",\"consoleText\":null,\"projectId\":{product3.ProjectId},\"jobId\":2,\"buildId\":2,\"projectUrl\":\"https://dev.scriptoria.io/projects/2\"}}", notifications[0].MessageSubstitutionsJson);
            Assert.Equal("buildFailedAdmin", notifications[0].MessageId);
            Assert.Null(notifications[0].LinkUrl);
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
         [Fact(Skip = skipAcceptanceTest)]
         public async Task Build_CreateAsync_Exception()
         {
             BuildTestData();
             var buildBuildService = _fixture.GetService<BuildEngineBuildService>();
             var mockBuildEngine = Mock.Get(buildBuildService.BuildEngineApi);
             var mockRecurringTaskManager = Mock.Get(buildBuildService.RecurringJobManager);
             mockRecurringTaskManager.Reset();
             mockBuildEngine.Reset();
             mockBuildEngine.Setup(x => x.CreateBuild(It.IsAny<int>(), It.IsAny<Build>())).Returns<BuildResponse>(null);
             var parmsDictionary = new Dictionary<string, object>
             {
                 {"targets", "apk play-listing" }
             };
             var ex = await Assert.ThrowsAsync<Exception>(async () => await buildBuildService.CreateBuildAsync(product1.Id, parmsDictionary,null));
             mockBuildEngine.Verify(x => x.SetEndpoint(
                 It.Is<String>(u => u == org1.BuildEngineUrl),
                 It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
             ));
             Assert.Equal("Create build failed", ex.Message);

             // Verify that notifications are sent to the user and the org admin
             var notifications = ReadTestData<AppDbContext, Notification>();
             Assert.Equal(2, notifications.Count);
             Assert.Equal("{\"projectName\":\"Test Project1\",\"productName\":\"TestProd1\"}", notifications[0].MessageSubstitutionsJson);
             Assert.Equal("buildFailedUnableToCreate", notifications[0].MessageId);
         }
     }
 }
