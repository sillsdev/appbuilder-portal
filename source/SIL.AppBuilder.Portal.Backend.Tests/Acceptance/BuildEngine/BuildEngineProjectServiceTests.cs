using System;
using Moq;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using Project = OptimaJet.DWKit.StarterApplication.Models.Project;
using BuildEngineProject = SIL.AppBuilder.BuildEngineApiClient.Project;
using SIL.AppBuilder.BuildEngineApiClient;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using OptimaJet.DWKit.StarterApplication.Repositories;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.BuildEngine
{
    [Collection("BuildEngineCollection")]
    public class BuildEngineProjectServiceTests : BaseTest<BuildEngineStartup>
    {
        const string skipAcceptanceTest = null;
        public User CurrentUser { get; set; }
        public User user1 { get; set; }
        public OrganizationMembership CurrentUserMembership { get; set; }
        public OrganizationMembership organizationMembership1 { get; set; }
        public OrganizationMembership organizationMembership2 { get; set; }
        public Organization org1 { get; private set; }
        public Organization org2 { get; private set; }
        public Group group1 { get; set; }
        public Group group2 { get; set; }
        public GroupMembership groupMembership1 { get; set; }
        public GroupMembership groupMembership2 { get; set; }
        public ApplicationType type1 { get; set; }
        public Project project1 { get; set; }
        public Project project2 { get; set; }
        public Project project3 { get; set; }
        public Project project4 { get; set; }
        public SystemStatus systemStatus1 { get; set; }
        public SystemStatus systemStatus2 { get; set; }
        public String DefaultBuildEngineUrl { get; set; }
        public String DefaultBuildEngineApiAccessToken { get; set; }
        public BuildEngineProjectServiceTests(TestFixture<BuildEngineStartup> fixture) : base(fixture)
        {
        }
        private void BuildTestData(bool available = true, string token = "replace")
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
                UseDefaultBuildEngine = false
            });
            org2 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg2",
                WebsiteUrl = "https://testorg2.org",
                BuildEngineUrl = "https://dontuse",
                BuildEngineApiAccessToken = "dontuse",
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
                IsPublic = true
            });
            project2 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project2",
                TypeId = type1.Id,
                Description = "Test Description 2",
                OwnerId = user1.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-US",
                WorkflowProjectId = 3,
                WorkflowProjectUrl = "ssh://APKAJU5Y3VNN3GHK3LLQ@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-DEM-LSDEV-eng-US-Test-Project8",
                IsPublic = true
            });
            project3 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project3",
                TypeId = type1.Id,
                Description = "Test Description 3",
                OwnerId = user1.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-US",
                WorkflowProjectId = 4,
                IsPublic = true
            });
            project4 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project4",
                TypeId = type1.Id,
                Description = "Test Description 4",
                OwnerId = user1.Id,
                GroupId = group2.Id,
                OrganizationId = org2.Id,
                Language = "eng-US",
                IsPublic = true
            });
            systemStatus1 = AddEntity<AppDbContext, SystemStatus>(new SystemStatus
            {
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = token,
                SystemAvailable = available
            });
            DefaultBuildEngineUrl = "https://default-buildengine:8443";
            DefaultBuildEngineApiAccessToken = "default_token";
            systemStatus2 = AddEntity<AppDbContext, SystemStatus>(new SystemStatus
            {
                BuildEngineUrl = DefaultBuildEngineUrl,
                BuildEngineApiAccessToken = DefaultBuildEngineApiAccessToken,
                SystemAvailable = available
            });
            Environment.SetEnvironmentVariable("DEFAULT_BUILDENGINE_URL", DefaultBuildEngineUrl);
            Environment.SetEnvironmentVariable("DEFAULT_BUILDENGINE_API_ACCESS_TOKEN", DefaultBuildEngineApiAccessToken);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Project_Not_FoundAsync()
        {
            BuildTestData(false);
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            await buildProjectService.ManageProjectAsync(999, null);
            // TODO: Verify notification
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Project_Connection_UnavailableAsync()
        {
            BuildTestData(false);
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            var ex = await Assert.ThrowsAsync<Exception>(async () => await buildProjectService.ManageProjectAsync(project1.Id, null));
            Assert.Equal("Connection not available", ex.Message);

        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Project_Connection_Not_Found()
        {
            BuildTestData(true, "4323864");
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            var ex = await Assert.ThrowsAsync<Exception>(async () => await buildProjectService.ManageProjectAsync(project1.Id, null));
            Assert.Equal("Connection not available", ex.Message);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Project_DefaultConnection_Not_Found()
        {
            BuildTestData(false);
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            var ex = await Assert.ThrowsAsync<Exception>(async () => await buildProjectService.ManageProjectAsync(project4.Id));
            Assert.Equal("Connection not available", ex.Message);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Project_Create_ProjectAsync()
        {
            BuildTestData();
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
            mockBuildEngine.Reset();
            var projectResponse = new ProjectResponse
            {
                Id = 1,
                Status = "initialized",
                Result = "",
                Error = "",
                Url = ""
            };
            mockBuildEngine.Setup(x => x.CreateProject(It.IsAny<BuildEngineProject>())).Returns(projectResponse);
            await buildProjectService.ManageProjectAsync(project1.Id, null);
            mockBuildEngine.Verify(x => x.SetEndpoint(
                It.Is<String>(u => u == org1.BuildEngineUrl),
                It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
            ));
            mockBuildEngine.Verify(x => x.CreateProject(
                It.Is<BuildEngineProject>(b => b.UserId == user1.Email)
            ));
            mockBuildEngine.Verify(x => x.CreateProject(
                It.Is<BuildEngineProject>(b => b.GroupId == group1.Abbreviation)
            ));
            mockBuildEngine.Verify(x => x.CreateProject(
                It.Is<BuildEngineProject>(b => b.AppId == type1.Name)
            ));
            mockBuildEngine.Verify(x => x.CreateProject(
                It.Is<BuildEngineProject>(b => b.ProjectName == project1.Name)
            ));
            var projects = ReadTestData<AppDbContext, Project>();
            var modifiedProject = projects.First(p => p.Id == project1.Id);
            Assert.Equal(1, modifiedProject.WorkflowProjectId);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Project_DefaultConnection_Create_ProjectAsync()
        {
            BuildTestData();
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
            mockBuildEngine.Reset();
            var projectResponse = new ProjectResponse
            {
                Id = 1,
                Status = "initialized",
                Result = "",
                Error = "",
                Url = ""
            };
            mockBuildEngine.Setup(x => x.CreateProject(It.IsAny<BuildEngineProject>())).Returns(projectResponse);
            await buildProjectService.ManageProjectAsync(project4.Id);
            mockBuildEngine.Verify(x => x.SetEndpoint(
                It.Is<String>(u => u == DefaultBuildEngineUrl),
                It.Is<String>(t => t == DefaultBuildEngineApiAccessToken)
            ));
            mockBuildEngine.Verify(x => x.CreateProject(
                It.Is<BuildEngineProject>(b => b.UserId == user1.Email)
            ));
            mockBuildEngine.Verify(x => x.CreateProject(
                It.Is<BuildEngineProject>(b => b.GroupId == group2.Abbreviation)
            ));
            mockBuildEngine.Verify(x => x.CreateProject(
                It.Is<BuildEngineProject>(b => b.AppId == type1.Name)
            ));
            mockBuildEngine.Verify(x => x.CreateProject(
                It.Is<BuildEngineProject>(b => b.ProjectName == project4.Name)
            ));
            var projects = ReadTestData<AppDbContext, Project>();
            var modifiedProject = projects.First(p => p.Id == project4.Id);
            Assert.Equal(1, modifiedProject.WorkflowProjectId);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Project_Create_Project_FailedAsync()
        {
            BuildTestData();
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
            mockBuildEngine.Reset();
            mockBuildEngine.Setup(x => x.CreateProject(It.IsAny<BuildEngineProject>())).Returns((ProjectResponse)null);
            var ex = await Assert.ThrowsAsync<Exception>(async () => await buildProjectService.ManageProjectAsync(project1.Id, null));
            Assert.Equal("Create project failed", ex.Message);
         }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Project_Completed()
        {
            BuildTestData();
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
            mockBuildEngine.Reset();
            var projectResponse = new ProjectResponse
            {
                Id = 4,
                Status = "completed",
                Result = "SUCCESS",
                Error = "",
                Url = "ssh://APKAJU5Y3VNN3GHK3LLQ@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-DEM-LSDEV-eng-US-Test-Project8"
            };
            mockBuildEngine.Setup(x => x.GetProject(It.IsAny<int>())).Returns(projectResponse);
            await buildProjectService.ManageProjectAsync(project3.Id, null);
            mockBuildEngine.Verify(x => x.SetEndpoint(
                It.Is<String>(u => u == org1.BuildEngineUrl),
                It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
            ));
            mockBuildEngine.Verify(x => x.GetProject(
                It.Is<int>(b => b == project3.WorkflowProjectId)
            ));
            var projects = ReadTestData<AppDbContext, Project>();
            var modifiedProject = projects.First(p => p.Id == project3.Id);
            Assert.Equal(projectResponse.Url, modifiedProject.WorkflowProjectUrl);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Project_Failed()
        {
            BuildTestData();
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
            mockBuildEngine.Reset();
            var projectResponse = new ProjectResponse
            {
                Id = 4,
                Status = "completed",
                Result = "FAILURE",
                Error = "",
                Url = "ssh://APKAJU5Y3VNN3GHK3LLQ@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-DEM-LSDEV-eng-US-Test-Project8"
            };
            mockBuildEngine.Setup(x => x.GetProject(It.IsAny<int>())).Returns(projectResponse);
            await buildProjectService.ManageProjectAsync(project3.Id, null);
            mockBuildEngine.Verify(x => x.SetEndpoint(
                It.Is<String>(u => u == org1.BuildEngineUrl),
                It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
            ));
            mockBuildEngine.Verify(x => x.GetProject(
                It.Is<int>(b => b == project3.WorkflowProjectId)
            ));
            var projects = ReadTestData<AppDbContext, Project>();
            var modifiedProject = projects.First(p => p.Id == project1.Id);
            Assert.Null(modifiedProject.WorkflowProjectUrl);
        }

        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Project_Status_Success()
        {
            BuildTestData();
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
            mockBuildEngine.Reset();
            var projectResponse = new ProjectResponse
            {
                Id = 3,
                Status = "completed",
                Result = "SUCCESS",
                Error = "",
                Url = "ssh://APKAJU5Y3VNN3GHK3LLQ@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-DEM-LSDEV-eng-US-Test-Project8"
            };
            mockBuildEngine.Setup(x => x.GetProject(It.IsAny<int>())).Returns(projectResponse);
            var status = await buildProjectService.GetStatusAsync(project2.Id);
            Assert.Equal(BuildEngineStatus.Success, status);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Get_Project_Status_Failure()
        {
            BuildTestData();
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
            mockBuildEngine.Reset();
            var projectResponse = new ProjectResponse
            {
                Id = 3,
                Status = "completed",
                Result = "FAILURE",
                Error = "Error"
            };
            mockBuildEngine.Setup(x => x.GetProject(It.IsAny<int>())).Returns(projectResponse);
            var status = await buildProjectService.GetStatusAsync(project2.Id);
            Assert.Equal(BuildEngineStatus.Failure, status);
        }
        [Fact(Skip = skipAcceptanceTest)]
        public async Task Project_Update_ProjectAsync()
        {
            BuildTestData();
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            var mockBuildEngine = Mock.Get(buildProjectService.BuildEngineApi);
            mockBuildEngine.Reset();
            var projectResponse = new ProjectResponse
            {
                Id = 3,
                Status = "completed",
                Result = "SUCCESS",
                Error = "",
                Url = "ssh://APKAJU5Y3VNN3GHK3LLQ@git-codecommit.us-east-1.amazonaws.com/v1/repos/scriptureappbuilder-DEM-LSDEV-eng-US-Test-Project8"
            };
            mockBuildEngine.Setup(x => x.UpdateProject(It.IsAny<int>(),It.IsAny<BuildEngineProject>())).Returns(projectResponse);
            await buildProjectService.UpdateProjectAsync(project2.Id, null);
            mockBuildEngine.Verify(x => x.SetEndpoint(
                It.Is<String>(u => u == org1.BuildEngineUrl),
                It.Is<String>(t => t == org1.BuildEngineApiAccessToken)
            ));
            mockBuildEngine.Verify(x => x.UpdateProject(
                It.Is<int>(i => i == project2.WorkflowProjectId),
                It.Is<BuildEngineProject>(b => b.UserId == user1.Email)
            ));
        }
    }
}
