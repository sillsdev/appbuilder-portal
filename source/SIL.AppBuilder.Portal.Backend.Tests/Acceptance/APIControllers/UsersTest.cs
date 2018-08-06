using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Optimajet.DWKit.StarterApplication.Data;
using Optimajet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    [Collection("WithoutAuthCollection")]
    public class UsersControllerTests : BaseTest<NoAuthStartup>
    {
        public UsersControllerTests(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }

        private async Task<User> GetCurrentUser()
        {
            var response = await Get("/api/users/current-user");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var user = await Deserialize<User>(response);

            return user;
        }

        [Fact]
        public async Task Get_CurrentUser_Creates_User()
        {
            var user = await GetCurrentUser();

            Assert.Equal("test-auth0-id", user.ExternalId);
            Assert.Equal(1, user.Id);
        }

        [Fact]
        public async Task Get_CurrentUser_Fetches_User()
        {
            var existing = NeedsCurrentUser();

            var user = await GetCurrentUser();

            Assert.Equal(existing.Id, user.Id);
        }

        [Fact]
        public async Task Patch_CurrentUser()
        {
            NeedsConfiguredCurrentUser();

            var user = await GetCurrentUser();
            var id = user.Id;
            var oldName = user.GivenName;

            var expectedGivenName = oldName + "-new!";
            var payload = ResourcePatchPayload(
                "users", id, new Dictionary<string, object>()
                {
                    { "given-name", expectedGivenName }
                }
            );


            var response = await Patch("/api/users/" + id, payload);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var updatedUser = await Deserialize<User>(response);


            Assert.Equal(expectedGivenName, updatedUser.GivenName);
        }

        [Fact]
        public async Task Patch_SomeUser()
        {
            var tuple = NeedsConfiguredCurrentUser();
            var user = AddEntity<AppDbContext, User>(new User());

            AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = user.Id,
                OrganizationId = tuple.Item2.OrganizationId
            });

            var expectedGivenName = user.GivenName + "-updated!";
            var payload = ResourcePatchPayload(
                "users", user.Id, new Dictionary<string, object>()
                {
                    { "given-name", expectedGivenName }
                });

            var response = await Patch("/api/users/" + user.Id, payload);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var updatedUser = await Deserialize<User>(response);

            Assert.Equal(expectedGivenName, updatedUser.GivenName);
        }

        [Fact]
        public async Task Patch_SomeUser_Different_Organization_NotFound()
        {
            NeedsConfiguredCurrentUser();
            var user = AddEntity<AppDbContext, User>(new User());

            var expectedGivenName = user.GivenName + "-updated!";
            var payload = ResourcePatchPayload(
                "users", user.Id, new Dictionary<string, object>()
                {
                    { "given-name", expectedGivenName }
                });

            var response = await Patch("/api/users/" + user.Id, payload);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
