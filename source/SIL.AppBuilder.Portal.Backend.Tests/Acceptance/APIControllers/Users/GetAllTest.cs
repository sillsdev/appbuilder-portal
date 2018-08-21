using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Optimajet.DWKit.StarterApplication.Data;
using Optimajet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Users
{
    [Collection("WithoutAuthCollection")]
    public class GetAllTests : BaseTest<NoAuthStartup>
    {
        public User CurrentUser { get; }
        public OrganizationMembership CurrentUserMembership { get; }
        public string CurrentOrganizationId { get; }

        public GetAllTests(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
            var tuple = NeedsConfiguredCurrentUser();

            CurrentUser = tuple.Item1;
            CurrentUserMembership = tuple.Item2;

            CurrentOrganizationId = CurrentUserMembership.OrganizationId.ToString();
        }

        [Fact]
        public async Task Get_Users_ForAOrganization() 
        {
            BuildTestData();

            var url = "/api/users?filter[organization-id]=" + CurrentOrganizationId;
            var response = await Get(url, CurrentOrganizationId);
            
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var users = await DeserializeList<User>(response);

            Assert.Equal(2, users.Count);
        }

        [Fact]
        public async Task Get_Users_ForAOrganization_IncludesRelationships() 
        {
            BuildTestData();

            var url = "/api/users?include=organization-memberships&filter[organization-id]=" + CurrentOrganizationId;
            var response = await Get(url, CurrentOrganizationId);
            
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var document = await DeserializeDocumentList(response);
            var included = document.Included;

            Assert.Equal(3, included.Count);
        }

        [Fact]
        public async Task Get_Users_ForAllRelevantOrganizations() 
        {
            BuildTestData();

            var response = await Get("/api/users");
            
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var users = await DeserializeList<User>(response);

            Assert.Equal(3, users.Count);
        }

        [Fact]
        public async Task Get_Users_InvalidOrganization()
        {
            BuildTestData();

            var response = await Get("/api/users?filter[organization-id]=abc");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var users = await DeserializeList<User>(response);

            Assert.Equal(0, users.Count);
        }

        [Fact]
        public async Task Get_Users_WithoutSpecifyingAFilter() 
        {
            var data = BuildTestData();
            var availableUsers = data.Item1;
            var availableIds = availableUsers.Select(u => u.Id).ToList();

            var response = await Get("/api/users");
            var users = await DeserializeList<User>(response);

            Assert.Equal(3, users.Count);

            var ids = users.Select(u => u.Id);

            Assert.Contains(availableIds[0], ids);
            Assert.Contains(availableIds[1], ids);
            Assert.DoesNotContain(availableIds[2], ids);

        }


        private Tuple<List<User>, List<Organization>> BuildTestData() 
        {
            // CurrentOrg
            //  - user1, currentUser
            // Org1
            //  - currentUser, user2
            // Org2
            //  - user3
            var user1 = AddEntity<AppDbContext, User>(new User());
            var user2 = AddEntity<AppDbContext, User>(new User());
            var user3 = AddEntity<AppDbContext, User>(new User());
            var org1 = AddEntity<AppDbContext, Organization>(new Organization());
            var org2 = AddEntity<AppDbContext, Organization>(new Organization());

            AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership {
                UserId = user1.Id,
                OrganizationId = CurrentUserMembership.OrganizationId
            });

            AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership {
                UserId = user2.Id,
                OrganizationId = org1.Id
            });

            AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership {
                UserId = CurrentUser.Id,
                OrganizationId = org1.Id
            });

            AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership {
                UserId = user3.Id,
                OrganizationId = org2.Id
            });

            return Tuple.Create(
                new List<User> { user1, user2, user3 },
                new List<Organization> { org1, org2 }
            );
        }

    }
}
