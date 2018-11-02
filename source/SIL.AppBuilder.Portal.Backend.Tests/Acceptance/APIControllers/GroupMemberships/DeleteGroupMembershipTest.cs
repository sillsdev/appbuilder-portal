using System;
using System.Net;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.GroupMemberships
{
    [Collection("WithoutAuthCollection")]
    public class DeleteGroupMembershipTest: BaseTest<NoAuthStartup>
    {
        public DeleteGroupMembershipTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }
        public User CurrentUser { get; set; }
        public OrganizationMembership CurrentUserMembership { get; set; }
        public OrganizationMembership CurrentUserMembership2 { get; set; }
        public OrganizationMembership orgMembership3 { get; set; }
        public User user1 { get; private set; }
        public Organization org1 { get; private set; }
        public Organization org2 { get; private set; }
        public Organization org3 { get; private set; }
        public Group group1 { get; set; }
        public Group group2 { get; set; }
        public Group group3 { get; set; }
        public Group group4 { get; set; }
        public GroupMembership groupMembership1 { get; set; }
        public GroupMembership groupMembership2 { get; set; }
        public ApplicationType type1 { get; set; }
        public Project project1 { get; set; }
        public Project project2 { get; set; }
        public Project project3 { get; set; }
        public Project project4 { get; set; }

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
                OwnerId = CurrentUser.Id

            });
            org2 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg2",
                WebsiteUrl = "https://testorg2.org",
                BuildEngineUrl = "https://buildengine.testorg2",
                BuildEngineApiAccessToken = "replace",
                OwnerId = CurrentUser.Id

            });
            org3 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg3",
                WebsiteUrl = "https://testorg3.org",
                BuildEngineUrl = "https://buildengine.testorg3",
                BuildEngineApiAccessToken = "replace",
                OwnerId = CurrentUser.Id

            });
            CurrentUserMembership = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = CurrentUser.Id,
                OrganizationId = org1.Id
            });
            CurrentUserMembership2 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = CurrentUser.Id,
                OrganizationId = org2.Id
            });
            orgMembership3 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
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
            group2 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup2",
                Abbreviation = "TG2",
                OwnerId = org1.Id
            });
            group3 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup3",
                Abbreviation = "TG3",
                OwnerId = org2.Id
            });
            group4 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup4",
                Abbreviation = "TG4",
                OwnerId = org3.Id
            });
            groupMembership1 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
            {
                UserId = CurrentUser.Id,
                GroupId = group1.Id
            });
            groupMembership2 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
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
                OwnerId = CurrentUser.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-AUS",
                IsPublic = true,
                DateArchived = null
            });

            var productDefinition1 = AddEntity<AppDbContext, ProductDefinition>(new ProductDefinition
            {
                Name = "First"
            });

            var product1 = AddEntity<AppDbContext, Product>(new Product
            {
                ProjectId = project1.Id,
                ProductDefinitionId = productDefinition1.Id
            });

        }

        [Fact]
        public async Task Delete_GroupMembership()
        {
            BuildTestData();
            var response = await Delete("/api/group-memberships/" + groupMembership2.Id.ToString());
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            var groupMemberships = ReadTestData<AppDbContext, GroupMembership>();
            Assert.Single(groupMemberships);
        }
        [Fact]
        public async Task Delete_GroupMembership_Failed()
        {
            BuildTestData();
            var response = await Delete("/api/group-memberships/" + groupMembership1.Id.ToString());
            Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);

            var groupMemberships = ReadTestData<AppDbContext, GroupMembership>();
            Assert.Equal(2, groupMemberships.Count);
        }
        [Fact]
        public async Task Delete_GroupMembership_Record_Not_Found()
        {
            BuildTestData();
            var response = await Delete("/api/group-memberships/999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var groupMemberships = ReadTestData<AppDbContext, GroupMembership>();
            Assert.Equal(2, groupMemberships.Count);
        }
    }
}
