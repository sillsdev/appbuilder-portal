// using System;
// using System.Linq;
// using System.Threading.Tasks;
// using Hangfire;
// using Hangfire.Common;
// using Hangfire.States;
// using Microsoft.AspNetCore.SignalR;
// using Moq;
// using OptimaJet.DWKit.StarterApplication.Data;
// using OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler;
// using OptimaJet.DWKit.StarterApplication.Models;
// using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
// using OptimaJet.DWKit.StarterApplication.Utility;
// using SIL.AppBuilder.BuildEngineApiClient;
// using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
// using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
// using Xunit;
// using BuildEngineProject = SIL.AppBuilder.BuildEngineApiClient.Project;
// using Job = Hangfire.Common.Job;
// using Project = OptimaJet.DWKit.StarterApplication.Models.Project;

// namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.BuildEngine
// {
//     [Collection("BuildEngineCollection")]
//     public class BuildEngineProjectServiceTests : BaseTest<BuildEngineStartup>
//     {
//         const string skipAcceptanceTest = null;
//         public User CurrentUser { get; set; }
//         public User user1 { get; set; }
//         public User user2 { get; set; }
//         public User user3 { get; set; }
//         public OrganizationMembership CurrentUserMembership { get; set; }
//         public OrganizationMembership organizationMembership1 { get; set; }
//         public OrganizationMembership organizationMembership2 { get; set; }
//         public OrganizationMembership organizationMembership3 { get; set; }
//         public Organization org1 { get; private set; }
//         public Organization org2 { get; private set; }
//         public Group group1 { get; set; }
//         public Group group2 { get; set; }
//         public GroupMembership groupMembership1 { get; set; }
//         public GroupMembership groupMembership2 { get; set; }
//         public GroupMembership groupMembership3 { get; set; }
//         public ApplicationType type1 { get; set; }
//         public Project project1 { get; set; }
//         public Project project2 { get; set; }
//         public Project project3 { get; set; }
//         public Project project4 { get; set; }
//         public Project project5 { get; set; }
//         public SystemStatus systemStatus1 { get; set; }
//         public SystemStatus systemStatus2 { get; set; }
//         public String DefaultBuildEngineUrl { get; set; }
//         public String DefaultBuildEngineApiAccessToken { get; set; }
//         public Role roleOA { get; set; }
//         public Role roleSA { get; set; }
//         public UserRole ur1 { get; set; }
//         public UserRole ur2 { get; set; }
//         public BuildEngineProjectServiceTests(TestFixture<BuildEngineStartup> fixture) : base(fixture)
//         {
//         }
//         private void BuildTestData(bool available = true, string token = "replace")
//         {
//             CurrentUser = NeedsCurrentUser();
//             roleOA = AddEntity<AppDbContext, Role>(new Role
//             {
//                 RoleName = RoleName.OrganizationAdmin
//             });
//             roleSA = AddEntity<AppDbContext, Role>(new Role
//             {
//                 RoleName = RoleName.SuperAdmin
//             });
//             user1 = AddEntity<AppDbContext, User>(new User
//             {
//                 ExternalId = "google-oauth2|123432423142312345678",
//                 Email = "test-email1@test.test",
//                 Name = "Test Testenson1",
//                 GivenName = "Test1",
//                 FamilyName = "Testenson1"
//             });
//             user2 = AddEntity<AppDbContext, User>(new User
//             {
//                 ExternalId = "auth0|5c3e04df7493d43852060b26",
//                 Email = "test-email2@test.test",
//                 Name = "Test Testenson2",
//                 GivenName = "Test2",
//                 FamilyName = "Testenson2"
//             });
//             user3 = AddEntity<AppDbContext, User>(new User
//             {
//                 ExternalId = "test-auth0-id3",
//                 Email = "test-email3@test.test",
//                 Name = "Test Testenson3",
//                 GivenName = "Test3",
//                 FamilyName = "Testenson3"
//             });
//             org1 = AddEntity<AppDbContext, Organization>(new Organization
//             {
//                 Name = "TestOrg1",
//                 WebsiteUrl = "https://testorg1.org",
//                 BuildEngineUrl = "https://buildengine.testorg1",
//                 BuildEngineApiAccessToken = "replace",
//                 UseDefaultBuildEngine = false
//             });
//             org2 = AddEntity<AppDbContext, Organization>(new Organization
//             {
//                 Name = "TestOrg2",
//                 WebsiteUrl = "https://testorg2.org",
//                 BuildEngineUrl = "https://dontuse",
//                 BuildEngineApiAccessToken = "dontuse",
//                 UseDefaultBuildEngine = true
//             });

//             CurrentUserMembership = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
//             {
//                 UserId = CurrentUser.Id,
//                 OrganizationId = org1.Id
//             });
//             organizationMembership1 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
//             {
//                 UserId = user1.Id,
//                 OrganizationId = org1.Id
//             });
//             organizationMembership2 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
//             {
//                 UserId = user1.Id,
//                 OrganizationId = org2.Id
//             });
//             organizationMembership3 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
//             {
//                 UserId = user2.Id,
//                 OrganizationId = org1.Id
//             });
//             group1 = AddEntity<AppDbContext, Group>(new Group
//             {
//                 Name = "TestGroup1",
//                 Abbreviation = "TG1",
//                 OwnerId = org1.Id
//             });
//             group2 = AddEntity<AppDbContext, Group>(new Group
//             {
//                 Name = "TestGroup2",
//                 Abbreviation = "TG2",
//                 OwnerId = org2.Id
//             });
//             groupMembership1 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
//             {
//                 UserId = user1.Id,
//                 GroupId = group1.Id
//             });
//             groupMembership2 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
//             {
//                 UserId = user1.Id,
//                 GroupId = group2.Id
//             });
//             groupMembership3 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
//             {
//                 UserId = user2.Id,
//                 GroupId = group1.Id
//             });
//             type1 = AddEntity<AppDbContext, ApplicationType>(new ApplicationType
//             {
//                 Name = "scriptureappbuilder",
//                 Description = "Scripture App Builder"
//             });
//             project1 = AddEntity<AppDbContext, Project>(new Project
//             {
//                 Name = "Test Project1",
//                 TypeId = type1.Id,
//                 Description = "Test Description",
//                 OwnerId = user1.Id,
//                 GroupId = group1.Id,
//                 OrganizationId = org1.Id,
//                 Language = "eng-US",
//                 IsPublic = true
//             });
//             project2 = AddEntity<AppDbContext, Project>(new Project
//             {
//                 Name = "Test Project2",
//                 TypeId = type1.Id,
//                 Description = "Test Description 2",
//                 OwnerId = user1.Id,
//                 GroupId = group1.Id,
//                 OrganizationId = org1.Id,
//                 Language = "eng-US",
//                 WorkflowProjectId = 3,
//                 WorkflowProjectUrl = "ssh://APKAJU5Y3VNN3GHK3LLQ@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-DEM-LSDEV-eng-US-Test-Project8",
//                 IsPublic = true
//             });
//             project3 = AddEntity<AppDbContext, Project>(new Project
//             {
//                 Name = "Test Project3",
//                 TypeId = type1.Id,
//                 Description = "Test Description 3",
//                 OwnerId = user1.Id,
//                 GroupId = group1.Id,
//                 OrganizationId = org1.Id,
//                 Language = "eng-US",
//                 WorkflowProjectId = 4,
//                 IsPublic = true
//             });
//             project4 = AddEntity<AppDbContext, Project>(new Project
//             {
//                 Name = "Test Project4",
//                 TypeId = type1.Id,
//                 Description = "Test Description 4",
//                 OwnerId = user1.Id,
//                 GroupId = group2.Id,
//                 OrganizationId = org2.Id,
//                 Language = "eng-US",
//                 IsPublic = true
//             });
//             project5 = AddEntity<AppDbContext, Project>(new Project
//             {
//                 Name = "Test Project5",
//                 TypeId = type1.Id,
//                 Description = "Test Description 5",
//                 OwnerId = user2.Id,
//                 GroupId = group1.Id,
//                 OrganizationId = org1.Id,
//                 Language = "eng-US",
//                 WorkflowProjectId = 3,
//                 WorkflowProjectUrl = "ssh://APKAJU5Y3VNN3GHK3LLQ@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-DEM-LSDEV-eng-US-Test-Project8",
//                 IsPublic = true
//             });
//             ur1 = AddEntity<AppDbContext, UserRole>(new UserRole
//             {
//                 UserId = user2.Id,
//                 RoleId = roleOA.Id,
//                 OrganizationId = org1.Id
//             });
//             ur2 = AddEntity<AppDbContext, UserRole>(new UserRole
//             {
//                 UserId = user3.Id,
//                 RoleId = roleSA.Id,
//                 OrganizationId = org1.Id
//             });
//             systemStatus1 = AddEntity<AppDbContext, SystemStatus>(new SystemStatus
//             {
//                 BuildEngineUrl = "https://buildengine.testorg1",
//                 BuildEngineApiAccessToken = token,
//                 SystemAvailable = available
//             });
//             DefaultBuildEngineUrl = "https://default-buildengine:8443";
//             DefaultBuildEngineApiAccessToken = "default_token";
//             systemStatus2 = AddEntity<AppDbContext, SystemStatus>(new SystemStatus
//             {
//                 BuildEngineUrl = DefaultBuildEngineUrl,
//                 BuildEngineApiAccessToken = DefaultBuildEngineApiAccessToken,
//                 SystemAvailable = available
//             });
//             Environment.SetEnvironmentVariable("DEFAULT_BUILDENGINE_URL", DefaultBuildEngineUrl);
//             Environment.SetEnvironmentVariable("DEFAULT_BUILDENGINE_API_ACCESS_TOKEN", DefaultBuildEngineApiAccessToken);
//         }
//         [Fact(Skip = skipAcceptanceTest)]
//         public async Task Project_Not_FoundAsync()
//         {
//             BuildTestData(false);
//             var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
//             var mockNotificationService = Mock.Get(buildProjectService.SendNotificationSvc.HubContext);
//             await buildProjectService.ManageProjectAsync(999, null);
//             // Verify notification sent to Super Admin
//             mockNotificationService.Verify(x => x.Clients.User(It.Is<string>(i => i == user3.ExternalId)));
//             var notifications = ReadTestData<AppDbContext, Notification>();
//             Assert.Single(notifications);
//             var expectedJson = "{\"projectId\":\"999\"}";
//             Assert.Equal(expectedJson, notifications[0].MessageSubstitutionsJson);
//             Assert.Equal("projectRecordNotFound", notifications[0].MessageId);
//         }
//         [Fact(Skip = skipAcceptanceTest)]
//         public async Task Project_Connection_UnavailableAsync()
//         {
//             BuildTestData(false);
//             var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
//             var mockNotificationService = Mock.Get(buildProjectService.SendNotificationSvc.HubContext);
//             var ex = await Assert.ThrowsAsync<Exception>(async () => await buildProjectService.ManageProjectAsync(project1.Id, null));
//             Assert.Equal("Connection not available", ex.Message);
//             // Verify notification sent to OrgAdmin and User
//             mockNotificationService.Verify(x => x.Clients.User(It.Is<string>(i => i == user1.ExternalId)));
//             mockNotificationService.Verify(x => x.Clients.User(It.Is<string>(i => i == user2.ExternalId)));
//             var notifications = ReadTestData<AppDbContext, Notification>();
//             Assert.Equal(2, notifications.Count);
//             Assert.Equal("{\"orgName\":\"TestOrg1\",\"projectName\":\"Test Project1\"}", notifications[0].MessageSubstitutionsJson);
//             Assert.Equal("projectFailedBuildEngine", notifications[0].MessageId);

//         }
//         [Fact(Skip = skipAcceptanceTest)]
//         public async Task Project_Connection_Not_Found()
//         {
//             BuildTestData(true, "4323864");
//             var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
//             var mockNotificationService = Mock.Get(buildProjectService.SendNotificationSvc.HubContext);
//             var ex = await Assert.ThrowsAsync<Exception>(async () => await buildProjectService.ManageProjectAsync(project1.Id, null));
//             Assert.Equal("Connection not available", ex.Message);
//             // Verify notification sent to OrgAdmin and User
//             mockNotificationService.Verify(x => x.Clients.User(It.Is<string>(i => i == user1.ExternalId)));
//             mockNotificationService.Verify(x => x.Clients.User(It.Is<string>(i => i == user2.ExternalId)));
//             var notifications = ReadTestData<AppDbContext, Notification>();
//             Assert.Equal(2, notifications.Count);
//             Assert.Equal("{\"orgName\":\"TestOrg1\",\"projectName\":\"Test Project1\"}", notifications[0].MessageSubstitutionsJson);
//             Assert.Equal("projectFailedBuildEngine", notifications[0].MessageId);
//         }
//         [Fact(Skip = skipAcceptanceTest)]
//         public async Task Project_DefaultConnection_Not_Found()
//         {
//             BuildTestData(false);
//             var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
//             var mockNotificationService = Mock.Get(buildProjectService.SendNotificationSvc.HubContext);
//             var ex = await Assert.ThrowsAsync<Exception>(async () => await buildProjectService.ManageProjectAsync(project4.Id, null));
//             Assert.Equal("Connection not available", ex.Message);
//             // Verify notification sent to OrgAdmin and User (no org admin for this project defined)
//             mockNotificationService.Verify(x => x.Clients.User(It.Is<string>(i => i == user1.ExternalId)));
//             var notifications = ReadTestData<AppDbContext, Notification>();
//             Assert.Single(notifications);
//             Assert.Equal("{\"orgName\":\"TestOrg2\",\"projectName\":\"Test Project4\"}", notifications[0].MessageSubstitutionsJson);
//             Assert.Equal("projectFailedBuildEngine", notifications[0].MessageId);
//         }
//         [Fact(Skip = skipAcceptanceTest)]
//         public async Task Project_Create_ProjectAsync()
//         {
//             BuildTestData();
//             var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
//             var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
//             mockBuildEngine.Reset();
//             var projectResponse = new ProjectResponse
//             {
//                 Id = 1,
//                 Status = "completed",
//                 Result = "SUCCESS",
//                 Error = "",
//                 Url = "s3://tst-stg-aps-projects/scriptureappbuilder/" + project1.Language + "-1-" + project1.Name.Replace(" ", "-")
//             };
//             mockBuildEngine.Setup(x => x.CreateProject(It.IsAny<BuildEngineProject>())).Returns(projectResponse);
//             await buildProjectService.ManageProjectAsync(project1.Id, null);
//             mockBuildEngine.Verify(x => x.SetEndpoint(
//                 It.Is<String>(u => u == org1.BuildEngineUrl),
//                 It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
//             ));
//             mockBuildEngine.Verify(x => x.CreateProject(
//                 It.Is<BuildEngineProject>(b => b.AppId == type1.Name)
//             ));
//             mockBuildEngine.Verify(x => x.CreateProject(
//                 It.Is<BuildEngineProject>(b => b.ProjectName == project1.Name)
//             ));
//             var backgroundJobClient = _fixture.GetService<IBackgroundJobClient>();
//             var backgroundJobClientMock = Mock.Get(backgroundJobClient);
//             var projects = ReadTestData<AppDbContext, Project>();
//             var modifiedProject = projects.First(p => p.Id == project1.Id);
//             Assert.Equal(1, modifiedProject.WorkflowProjectId);
//             Assert.Equal(projectResponse.Url, modifiedProject.WorkflowProjectUrl);
//             var notifications = ReadTestData<AppDbContext, Notification>();
//             Assert.Single(notifications);
//             Assert.Equal("{\"projectName\":\"Test Project1\"}", notifications[0].MessageSubstitutionsJson);
//             Assert.Equal("projectCreatedSuccessfully", notifications[0].MessageId);
//             backgroundJobClientMock.Verify(x => x.Create(
//                 It.Is<Job>(job =>
//                            job.Method.Name == "DidUpdate" &&
//                            job.Type == typeof(IEntityHookHandler<Project,Int32>)),
//                 It.IsAny<EnqueuedState>()));
//         }
//         [Fact(Skip = skipAcceptanceTest)]
//         public async Task Project_DefaultConnection_Create_ProjectAsync()
//         {
//             BuildTestData();
//             var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
//             var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
//             mockBuildEngine.Reset();
//             var projectResponse = new ProjectResponse
//             {
//                 Id = 1,
//                 Status = "completed",
//                 Result = "SUCCESS",
//                 Error = "",
//                 Url = "s3://tst-stg-aps-projects/scriptureappbuilder/" + project4.Language + "-1-" + project4.Name.Replace(" ", "-")
//             };
//             mockBuildEngine.Setup(x => x.CreateProject(It.IsAny<BuildEngineProject>())).Returns(projectResponse);
//             await buildProjectService.ManageProjectAsync(project4.Id, null);
//             mockBuildEngine.Verify(x => x.SetEndpoint(
//                 It.Is<String>(u => u == DefaultBuildEngineUrl),
//                 It.Is<String>(t => t == DefaultBuildEngineApiAccessToken)
//             ));
//             mockBuildEngine.Verify(x => x.CreateProject(
//                 It.Is<BuildEngineProject>(b => b.AppId == type1.Name)
//             ));
//             mockBuildEngine.Verify(x => x.CreateProject(
//                 It.Is<BuildEngineProject>(b => b.ProjectName == project4.Name)
//             ));
//             var projects = ReadTestData<AppDbContext, Project>();
//             var modifiedProject = projects.First(p => p.Id == project4.Id);
//             Assert.Equal(1, modifiedProject.WorkflowProjectId);
//             Assert.Equal(projectResponse.Url, modifiedProject.WorkflowProjectUrl);
//             var notifications = ReadTestData<AppDbContext, Notification>();
//             Assert.Single(notifications);
//             Assert.Equal("{\"projectName\":\"Test Project4\"}", notifications[0].MessageSubstitutionsJson);
//             Assert.Equal("projectCreatedSuccessfully", notifications[0].MessageId);
//         }
//         [Fact(Skip = skipAcceptanceTest)]
//         public async Task Project_Create_Project_FailedAsync()
//         {
//             BuildTestData();
//             var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
//             var mockNotificationService = Mock.Get(buildProjectService.SendNotificationSvc.HubContext);
//             var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
//             mockBuildEngine.Reset();
//             mockBuildEngine.Setup(x => x.CreateProject(It.IsAny<BuildEngineProject>())).Returns((ProjectResponse)null);
//             var ex = await Assert.ThrowsAsync<Exception>(async () => await buildProjectService.ManageProjectAsync(project1.Id, null));
//             Assert.Equal("Create project failed", ex.Message);
//             // Verify notification sent to OrgAdmin and User
//             mockNotificationService.Verify(x => x.Clients.User(It.Is<string>(i => i == user1.ExternalId)));
//             mockNotificationService.Verify(x => x.Clients.User(It.Is<string>(i => i == user2.ExternalId)));
//             var notifications = ReadTestData<AppDbContext, Notification>();
//             Assert.Equal(2, notifications.Count);
//             Assert.Equal("{\"projectName\":\"Test Project1\"}", notifications[0].MessageSubstitutionsJson);
//             Assert.Equal("projectFailedUnableToCreate", notifications[0].MessageId);
//         }
//         [Fact(Skip = skipAcceptanceTest)]
//         public async Task Project_Failed()
//         {
//             BuildTestData();
//             var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
//             var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
//             mockBuildEngine.Reset();
//             var projectResponse = new ProjectResponse
//             {
//                 Id = 4,
//                 Status = "completed",
//                 Result = "FAILURE",
//                 Error = "",
//                 Url = ""
//             };
//             mockBuildEngine.Setup(x => x.CreateProject(It.IsAny<BuildEngineProject>())).Returns(projectResponse);
//             await buildProjectService.ManageProjectAsync(project3.Id, null);
//             mockBuildEngine.Verify(x => x.SetEndpoint(
//                 It.Is<String>(u => u == org1.BuildEngineUrl),
//                 It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
//             ));
//             mockBuildEngine.Verify(x => x.CreateProject(
//                 It.Is<BuildEngineProject>(b => b.AppId == type1.Name)
//             ));
//             mockBuildEngine.Verify(x => x.CreateProject(
//                 It.Is<BuildEngineProject>(b => b.ProjectName == project3.Name)
//             ));
//             var projects = ReadTestData<AppDbContext, Project>();
//             var modifiedProject = projects.First(p => p.Id == project3.Id);
//             Assert.Null(modifiedProject.WorkflowProjectUrl);
//             var notifications = ReadTestData<AppDbContext, Notification>();
//             Assert.Equal(2, notifications.Count);
//             Assert.Equal("{\"projectName\":\"Test Project3\",\"projectStatus\":\"completed\",\"projectError\":\"\",\"buildEngineUrl\":\"https://buildengine.testorg1/project-admin/view?id=4\"}", notifications[0].MessageSubstitutionsJson);
//             Assert.Equal("https://buildengine.testorg1/project-admin/view?id=4", notifications[0].LinkUrl);
//             Assert.Equal("projectCreationFailedAdmin", notifications[0].MessageId);
//         }
//         [Fact(Skip = skipAcceptanceTest)]
//         public async Task GetTokenTest()
//         {
//             BuildTestData();
//             var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
//             var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
//             mockBuildEngine.Reset();
//             var tokenResponse = new TokenResponse
//             {
//                 SecretAccessKey = "FAKE8eoBaiULHZcu80MtbUTJzjyQRzr6D+2lM6S0",
//                 AccessKeyId = "FAKERW6IRVMN2NLBQBU5",
//                 Expiration = "2019-02-21T04:01:07+00:00",
//                 SessionToken = "FAKEZXIvYXdzECkaDIKOGv4uY00Tzz/9PCK0A2w4pLinn/vXTqABzc8d0xdhk62qimQ+SG015SpqMt2uY1KgYhd/I1HYaJamTZ54YLRZJbIQ/MYHvoqGXojfWahtb4rHgwFC2cz9q44BMhPuPFfzHny3Qlwtb2Q1YBc6nhJ6e9aFP9AS+zhM4oU60dHmzhL3961OSpsHhrIw/7c0sjl9MQnurl9eJOIJVB11+eNFIeIVqKRnsPpapVqo/zoi+a0nxO6VTHWYwKKj1vbOeM0vJpcQHZpGxraiL5k5d7Hmvv3jCKlogoCaB0N0kU8794sG3MwnRTrvQgPAR14BvUgIrurk1BP3YCMDDDKgrYXYMRnODnxMXgbLxgLqBUtvpP30Au1gjAQ3nJNn5iZgfGuamLeoRMG3trjascqAMoL6gsKOmJg2OYqN5HLVFfqlMWcLyLG42+zXAF3FjzOCNyuBYcD6ULQst49AaS+qXTYn4uSTfyAhov4jos8tmvySkO3yIzbCL1Ra4E6obbls+xU6MDv2lNM23NnKdEnLfc6JffuJgPDmChOLPus3fCqcv0JIteAw2balOPH+VCoFLzfAutuhGc7gTKmAjOCn9uEKG5gow/O14wU="
//             };
//             mockBuildEngine.Setup(x => x.GetProjectAccessToken(It.IsAny<int>(), It.IsAny<TokenRequest>())).Returns(tokenResponse);
//             var response = await buildProjectService.GetProjectTokenAsync(project2.Id);
//             mockBuildEngine.Verify(x => x.GetProjectAccessToken(
//                 It.Is<int>(i => i == project2.WorkflowProjectId),
//                 It.Is<TokenRequest>(t => t.Name == "g2=123432423142312345678")
//             ));
//             Assert.NotNull(response);
//             Assert.Equal(tokenResponse.SessionToken, response.SessionToken);
//             Assert.Equal(tokenResponse.AccessKeyId, response.AccessKeyId);
//             Assert.Equal(tokenResponse.SecretAccessKey, response.SecretAccessKey);
//         }
//         [Fact(Skip = skipAcceptanceTest)]
//         public async Task GetTokenWithAuth0Test()
//         {
//             BuildTestData();
//             var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
//             var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
//             mockBuildEngine.Reset();
//             var tokenResponse = new TokenResponse
//             {
//                 SecretAccessKey = "FAKE8eoBaiULHZcu80MtbUTJzjyQRzr6D+2lM6S0",
//                 AccessKeyId = "FAKERW6IRVMN2NLBQBU5",
//                 Expiration = "2019-02-21T04:01:07+00:00",
//                 SessionToken = "FAKEZXIvYXdzECkaDIKOGv4uY00Tzz/9PCK0A2w4pLinn/vXTqABzc8d0xdhk62qimQ+SG015SpqMt2uY1KgYhd/I1HYaJamTZ54YLRZJbIQ/MYHvoqGXojfWahtb4rHgwFC2cz9q44BMhPuPFfzHny3Qlwtb2Q1YBc6nhJ6e9aFP9AS+zhM4oU60dHmzhL3961OSpsHhrIw/7c0sjl9MQnurl9eJOIJVB11+eNFIeIVqKRnsPpapVqo/zoi+a0nxO6VTHWYwKKj1vbOeM0vJpcQHZpGxraiL5k5d7Hmvv3jCKlogoCaB0N0kU8794sG3MwnRTrvQgPAR14BvUgIrurk1BP3YCMDDDKgrYXYMRnODnxMXgbLxgLqBUtvpP30Au1gjAQ3nJNn5iZgfGuamLeoRMG3trjascqAMoL6gsKOmJg2OYqN5HLVFfqlMWcLyLG42+zXAF3FjzOCNyuBYcD6ULQst49AaS+qXTYn4uSTfyAhov4jos8tmvySkO3yIzbCL1Ra4E6obbls+xU6MDv2lNM23NnKdEnLfc6JffuJgPDmChOLPus3fCqcv0JIteAw2balOPH+VCoFLzfAutuhGc7gTKmAjOCn9uEKG5gow/O14wU="
//             };
//             mockBuildEngine.Setup(x => x.GetProjectAccessToken(It.IsAny<int>(), It.IsAny<TokenRequest>())).Returns(tokenResponse);
//             var response = await buildProjectService.GetProjectTokenAsync(project5.Id);
//             mockBuildEngine.Verify(x => x.GetProjectAccessToken(
//                 It.Is<int>(i => i == project5.WorkflowProjectId),
//                 It.Is<TokenRequest>(t => t.Name == "a0=5c3e04df7493d43852060b26")
//             ));
//             Assert.NotNull(response);
//             Assert.Equal(tokenResponse.SessionToken, response.SessionToken);
//             Assert.Equal(tokenResponse.AccessKeyId, response.AccessKeyId);
//             Assert.Equal(tokenResponse.SecretAccessKey, response.SecretAccessKey);
//         }
//         [Fact(Skip = skipAcceptanceTest)]
//         public async Task GetTokenFailedTest()
//         {
//             BuildTestData();
//             var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
//             var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
//             mockBuildEngine.Reset();
//             var tokenResponse = new TokenResponse
//             {
//                 SecretAccessKey = "FAKE8eoBaiULHZcu80MtbUTJzjyQRzr6D+2lM6S0",
//                 AccessKeyId = "FAKERW6IRVMN2NLBQBU5",
//                 Expiration = "2019-02-21T04:01:07+00:00",
//                 SessionToken = "FAKEZXIvYXdzECkaDIKOGv4uY00Tzz/9PCK0A2w4pLinn/vXTqABzc8d0xdhk62qimQ+SG015SpqMt2uY1KgYhd/I1HYaJamTZ54YLRZJbIQ/MYHvoqGXojfWahtb4rHgwFC2cz9q44BMhPuPFfzHny3Qlwtb2Q1YBc6nhJ6e9aFP9AS+zhM4oU60dHmzhL3961OSpsHhrIw/7c0sjl9MQnurl9eJOIJVB11+eNFIeIVqKRnsPpapVqo/zoi+a0nxO6VTHWYwKKj1vbOeM0vJpcQHZpGxraiL5k5d7Hmvv3jCKlogoCaB0N0kU8794sG3MwnRTrvQgPAR14BvUgIrurk1BP3YCMDDDKgrYXYMRnODnxMXgbLxgLqBUtvpP30Au1gjAQ3nJNn5iZgfGuamLeoRMG3trjascqAMoL6gsKOmJg2OYqN5HLVFfqlMWcLyLG42+zXAF3FjzOCNyuBYcD6ULQst49AaS+qXTYn4uSTfyAhov4jos8tmvySkO3yIzbCL1Ra4E6obbls+xU6MDv2lNM23NnKdEnLfc6JffuJgPDmChOLPus3fCqcv0JIteAw2balOPH+VCoFLzfAutuhGc7gTKmAjOCn9uEKG5gow/O14wU="
//             };
//             mockBuildEngine.Setup(x => x.GetProjectAccessToken(It.IsAny<int>(), It.IsAny<TokenRequest>())).Returns(tokenResponse);
//             var response = await buildProjectService.GetProjectTokenAsync(999);
//             Assert.Null(response);
//         }
//     }
// }
