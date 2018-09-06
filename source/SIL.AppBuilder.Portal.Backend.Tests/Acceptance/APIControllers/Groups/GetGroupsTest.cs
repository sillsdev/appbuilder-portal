using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Optimajet.DWKit.StarterApplication.Data;
using Optimajet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Groups
{
    [Collection("WithoutAuthCollection")]
    public class GetGroupsTest : BaseTest<NoAuthStartup>
    {
        public GetGroupsTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }

        public User CurrentUser { get; set; }
        public OrganizationMembership CurrentUserMembership { get; set; }
        public OrganizationMembership CurrentUserMembership2 { get; set;}
        public User user1 { get; private set; }
        public User user2 { get; private set; }
        public User user3 { get; private set; }
        public Organization org1 { get; private set; }
        public Organization org2 { get; private set; }
        public Organization org3 { get; private set; }
        public Group group1 { get; set; }
        public Group group2 { get; set; }
        public Group group3 { get; set; }
        public Group group4 { get; set; }
        public GroupMembership groupMembership1 { get; set; }

        private void BuildTestData()
        {
            CurrentUser = NeedsCurrentUser();
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
        }

        [Fact]
        public async Task Get_Groups_For_An_OrganizationHeader()
        {
            BuildTestData();

            var url = "/api/groups" ;
            var response = await Get(url, org1.Id.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var groups = await DeserializeList<Group>(response);

            Assert.Equal(2, groups.Count);

            var ids = groups.Select(g => g.Id);

            Assert.Contains(group1.Id, ids);
            Assert.Contains(group2.Id, ids);
            Assert.DoesNotContain(group3.Id, ids);
            Assert.DoesNotContain(group4.Id, ids);
        }
        [Fact] async Task Get_With_No_Organization()
        {
            BuildTestData();
            var url = "/api/groups";
            // This test verifies the case where an empty string
            // is used as the value for the organization header field.
            // The test Get, called below, by default, inserts an empty string
            // into the organization header field, testing that case.
            var response = await Get(url);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var groups = await DeserializeList<Group>(response);

            Assert.Equal(3, groups.Count);

            var ids = groups.Select(g => g.Id);

            Assert.Contains(group1.Id, ids);
            Assert.Contains(group2.Id, ids);
            Assert.Contains(group3.Id, ids);
            // Group 4 is not included because it belongs to an 
            // organization that the current user is not a member of
            Assert.DoesNotContain(group4.Id, ids);

        }
        [Fact]
        async Task Get_With_Invalid_Organization()
        {
            // Current user is not a member of the organization
            // being requested.
            BuildTestData();
            var url = "/api/groups";
            var response = await Get(url, org3.Id.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var groups = await DeserializeList<Group>(response);

            Assert.Empty(groups);
        }
    }
}
