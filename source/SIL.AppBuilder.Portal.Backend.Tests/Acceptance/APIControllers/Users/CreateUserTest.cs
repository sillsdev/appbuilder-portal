using System;
using System.Net;
using System.Threading.Tasks;
using Optimajet.DWKit.StarterApplication.Data;
using Optimajet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Users
{
    [Collection("WithoutAuthCollection")]
    public class CreateUserTest : BaseTest<NoAuthStartup>
    {
        public CreateUserTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }
        [Fact]
        public async Task Create_User_Not_Allowed()
        {
 
            var content = new
            {
                data = new
                {
                    type = "users",
                    attributes = new
                    {
                        name = "user1",
                        givenName = "given",
                        familyName = "family",
                        email = "user1@test.com",
                        phone = "555-5555",
                        timezone = "EST",
                        locale = "eng-us",
                        islocked = "0"
                    }
                }
            };
            var response = await Post("/api/users/", content);

            Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);

        }

    }
}
