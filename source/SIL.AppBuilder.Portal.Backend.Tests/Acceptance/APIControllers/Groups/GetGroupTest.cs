using System.Net;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Groups
{
    [Collection("WithoutAuthCollection")]
    public class GetGroupTest : BaseTest<NoAuthStartup>
    {
        public GetGroupTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }

        public User CurrentUser { get; set; }
        public OrganizationMembership CurrentUserMembership { get; set; }
        public OrganizationMembership CurrentUserMembership2 { get; set; }
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
        public async Task Get_Group_With_An_OrganizationHeader()
        {
            BuildTestData();

            var url = "/api/groups/" + group1.Id.ToString();
            var response = await Get(url, org1.Id.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var group = await Deserialize<Group>(response);

            Assert.Equal(group.Id, group1.Id);
        }
        [Fact]
        public async Task Get_Group_By_Id_Empty_Organization_Header()
        {
            BuildTestData();
            var url = "/api/groups/" + group1.Id.ToString();
            var response = await Get(url, addOrgHeader: false);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var group = await Deserialize<Group>(response);

            Assert.Equal(group.Id, group1.Id);

        }
        [Fact]
        public async Task Get_Invalid_Group()
        {
            // Attempt to get group that has an owner that 
            // the current user down't belong to
            BuildTestData();
            var url = "/api/groups/" + group4.Id.ToString();
            var response = await Get(url, allOrgs: true);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        }
        [Fact]
        public async Task Get_Group_With_Wrong_Organization()
        {
            BuildTestData();
            var url = "/api/groups/" + group3.Id.ToString();
            var response = await Get(url, org1.Id.ToString());

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        }
    }
}
