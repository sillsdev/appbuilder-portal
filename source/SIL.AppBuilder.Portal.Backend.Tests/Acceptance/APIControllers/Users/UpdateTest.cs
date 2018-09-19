using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Users
{
    [Collection("WithoutAuthCollection")]
    public class UpdateTests : BaseTest<NoAuthStartup>
    {
        public UpdateTests(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task Patch_CurrentUser()
        {
            var tuple = NeedsConfiguredCurrentUser();

            var user = tuple.Item1;
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
        public async Task Patch_SomeUser_FromTheWrongOrganization()
        {
            var tuple = NeedsConfiguredCurrentUser();
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


        [Fact]
        public async Task Patch_SomeUser_WhenAnOrganizationIsSpecified_AndTheUserIsInThatOrganizaiton()
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

            var response = await Patch("/api/users/" + user.Id, payload, tuple.Item2.OrganizationId.ToString());

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
