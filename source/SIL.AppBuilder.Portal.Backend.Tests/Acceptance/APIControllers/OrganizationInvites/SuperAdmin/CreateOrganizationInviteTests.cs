using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using Moq;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.OrganizationInvites.SuperAdmin
{
    [Collection("WithoutAuthCollection")]
    public class CreateOrganizationInviteTest : BaseTest<NoAuthStartup>
    {
        public CreateOrganizationInviteTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
            BuildTestData();
        }

        public User SuperAdmin { get; set; }

        private void BuildTestData()
        {
            SuperAdmin = NeedsCurrentUser();
          
            NeedsRoles();

            NeedsTestData<AppDbContext, UserRole>(new List<UserRole> {
                new UserRole { User = SuperAdmin, RoleId = int.Parse(RoleName.SuperAdmin.ToString()) },
            });
       
        }

        // TODO: fix
        // [Fact]
        public async Task Create_Succeeds_for_SuperAdmin()
        {
            var content = new
            {
                data = new
                {
                    type = "organization-invites",
                    attributes = new Dictionary<string, string>
                    {
                        { "name", "some name" },
                        { "owner-email", "some email" },
                        { "url", "someurl" },
                    }
                }
            };

            var response = await Post("/api/organization-invites/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }
    }
}

