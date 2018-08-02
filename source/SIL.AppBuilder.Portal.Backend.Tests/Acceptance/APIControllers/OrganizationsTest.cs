using System.Net;
using System.Threading.Tasks;
using Optimajet.DWKit.StarterApplication.Models;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    [Collection("WithoutAuthCollection")]
    public class OrganizationControllerTests : BaseTest<NoAuthStartup>
    {
        public OrganizationControllerTests(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task GetOrganizations_None() {
          var response = await Get("/api/organizations");

          Assert.Equal(HttpStatusCode.OK, response.StatusCode);

          var orgs = await DeserializeList<Organization>(response);

          Assert.Equal(0, orgs.Count);
        }

  
    }
}
