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

        [Fact]
        public async Task GetCurrentUser()
        {
            var response = await Get("/api/users/current-user");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var user = await Deserialize<User>(response);

            Assert.Equal("test-auth0-id", user.ExternalId);
        }
    }
}
