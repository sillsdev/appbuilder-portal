using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Users
{
    [Collection("WithoutAuthCollection")]
    public class CurrentUserTests : BaseTest<NoAuthStartup>
    {
        public CurrentUserTests(TestFixture<NoAuthStartup> fixture) : base(fixture)
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
        public async Task Get_CurrentUser_Includes_IncludedResources()
        {
            NeedsConfiguredCurrentUser();

            var response = await Get("/api/users/current-user?include=organization-memberships");
            
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var document = await DeserializeDocument(response);

            Assert.NotNull(document.Included);

            var firstIncluded = document.Included[0];

            Assert.NotNull(firstIncluded.Relationships);
        }

        [Fact]
        public async Task Get_CurrentUser_Creates_User()
        {
            int before = ReadTestData<AppDbContext, User>().Count;
            var user = await GetCurrentUser();
            int after = ReadTestData<AppDbContext, User>().Count;

            Assert.Equal("test-auth0-id", user.ExternalId);
            Assert.Equal(after, before + 1);
        }

        [Fact]
        public async Task Get_CurrentUser_Fetches_User()
        {
            var existing = NeedsCurrentUser();

            var user = await GetCurrentUser();

            Assert.Equal(existing.Id, user.Id);
        }

        /// <summary>
        /// Getting the current user (edit the user profile) when a different
        /// organization is the current organization (e.g. viewing users from
        /// a different organization) should always be allowed and return the
        /// current user.
        /// </summary>
        /// <returns>The current user different organization found.</returns>
        [Fact]
        public async Task Get_CurrentUser_CurrentOrganizationDoesNotMatter_Found()
        {
            var user = await GetCurrentUser();
            var myOrg = NeedsDefaultOrganization(user);

            var otherOrg = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "Foo"
            });

            var response = await Get($"/api/users/{user.Id}", otherOrg.Id.ToString());
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}
