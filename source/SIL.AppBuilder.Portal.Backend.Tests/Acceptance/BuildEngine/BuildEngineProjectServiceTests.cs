using System;
using Moq;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using Project = OptimaJet.DWKit.StarterApplication.Models.Project;
using SIL.AppBuilder.BuildEngineApiClient;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.BuildEngine
{
    [Collection("BuildEngineCollection")]
    public class BuildEngineProjectServiceTests : BaseTest<BuildEngineStartup>
    {
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
        public BuildEngineProjectServiceTests(TestFixture<BuildEngineStartup> fixture) : base(fixture)
        {
        }
        private void BuildTestData()
        {
//            CurrentUser = NeedsCurrentUser();
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
            //CurrentUserMembership = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            //{
            //    UserId = CurrentUser.Id,
            //    OrganizationId = org1.Id
            //});
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
                Private = false
            });
            systemStatus1 = AddEntity<AppDbContext, SystemStatus>(new SystemStatus
            {
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = "replace"
            });
        }
        [Fact]
        public async System.Threading.Tasks.Task Project_Not_FoundAsync()
        {
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            await buildProjectService.ManageProjectAsync(1);
            //Action act = () => buildProjectService.ManageProjectAsync(1);
            //Exception ex  = Assert.Throws<Exception>(act);
            //Assert.Equal("Project record not found", ex.Message);
        }
        [Fact]
        public async System.Threading.Tasks.Task Project_Connection_UnavailableAsync()
        {
            BuildTestData();
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            systemStatus1.SystemAvailable = false;
            await buildProjectService.ManageProjectAsync(project1.Id);
            //Action act = () => buildProjectService.ManageProjectAsync(project1.Id);
            //Exception ex = Assert.Throws<Exception>(act);
            //Assert.Equal("Connection not available", ex.Message);
        }
        [Fact]
        public async System.Threading.Tasks.Task Project_Connection_Not_FoundAsync()
        {
            BuildTestData();
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            systemStatus1.SystemAvailable = true;
            org1.BuildEngineApiAccessToken = "4323864";
            await buildProjectService.ManageProjectAsync(project1.Id);
            //Action act = () => buildProjectService.ManageProjectAsync(project1.Id);
            //Exception ex = Assert.Throws<Exception>(act);
            //Assert.Equal("SystemStatus record for connection not found", ex.Message);
        }
        [Fact]
        public async System.Threading.Tasks.Task Project_Create_ProjectAsync()
        {
            BuildTestData();
            var buildProjectService = _fixture.GetService<BuildEngineProjectService>();
            systemStatus1.SystemAvailable = true;
            org1.BuildEngineApiAccessToken = "4323864";
            await buildProjectService.ManageProjectAsync(project1.Id);
            //Action act = () => buildProjectService.ManageProjectAsync(project1.Id);
            //Exception ex = Assert.Throws<Exception>(act);
            //Assert.Equal("SystemStatus record for connection not found", ex.Message);

        }

    }
}
