using System.Threading.Tasks;
using FluentAssertions;
using Optimajet.DWKit.StarterApplication.Models;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    [Collection("WebHostCollection")]
    public class OrganizationControllerTests : BaseTest
    {
        public OrganizationControllerTests(TestFixture<TestStartup> fixture) : base(fixture)
        {}

        [Fact]
        public async Task GetOrganizations_None() {
          var response = await Get("/api/organizations");
          var orgs = await DeserializeList<Organization>(response);

          var actual = orgs.Count;

          actual.Should().Equals(0);
        }
    }
}
