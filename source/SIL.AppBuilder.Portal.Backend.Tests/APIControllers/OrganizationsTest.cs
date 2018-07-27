using System.Collections.Generic;
using FluentAssertions;
using Optimajet.DWKit.StarterApplication.Controllers;
using Optimajet.DWKit.StarterApplication.Data;
using Optimajet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Support;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
  public class OrganizationTests : BaseApiControllerTest<OrganizationsController>
  {
    private void BuildTestData()
    {
      NeedsTestData<AppDbContext, Organization>(
          new List<Organization>
          {
            new Organization { Id = 1, Name = "DeveloperTown" },
            new Organization { Id = 2, Name = "SIL" }
          }
      );
    }

    [Fact]
    public void Create_Assigns_CurrentUser() {
      BuildTestData();

      var newOrg = new Organization { Name = "New Org" };

      var actual = Controller.PostAsync(newOrg).Result;

      actual.Should().NotBeNull();
      actual.Should().BeOfType<Organization>();
      /* actual.Id.Should().Be(3); */
    }

  }
}
