using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.OrganizationMemberships
{
    [Collection("WithoutAuthCollection")]
    public class CreateTest : BaseTest<NoAuthStartup>
    {
    public User CurrentUser { get; private set; }
    public Organization Organization { get; private set; }

    private User user1;
    private User user2;

    public CreateTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
    {
    }

        protected void BuildTestData()
        {
            var CurrentUserData = NeedsConfiguredCurrentUser();
            CurrentUser = CurrentUserData.Item1;
            Organization = CurrentUserData.Item3;

            user1 = AddEntity<AppDbContext, User>(new User
            {
                ExternalId = "test-auth0-id1",
                Email = "test-email1@test.test",
                Name = "Test Testenson1",
                GivenName = "Test1",
                FamilyName = "Testenson1"
            });

            user2 = AddEntity<AppDbContext, User>(new User
            {
                ExternalId = "test-auth0-id1",
                Email = "test-email2@test.test",
                Name = "Test Testenson1",
                GivenName = "Test1",
                FamilyName = "Testenson1"
            });
            
            NeedsTestData<AppDbContext, Role>(new List<Role> {
                new Role { RoleName = RoleName.SuperAdmin },
                new Role { RoleName = RoleName.OrganizationAdmin },
                new Role { RoleName = RoleName.AppBuilder },
            });

            var orgAdmin = this.GetDbSet<Role>()
                .Where(r => r.RoleName == RoleName.OrganizationAdmin)
                .FirstOrDefault();

            NeedsTestData<AppDbContext, UserRole>(new List<UserRole> {
                new UserRole { 
                    User = user2,
                    Organization = Organization,
                    Role = orgAdmin,
                },
            });
        }

        [Fact]
        public async Task Create_Default()
        {
            BuildTestData();

            Assert.Equal(user1.UserRoles, null);

            var content = new
            {
                data = new
                {
                    type = "organization-memberships",
                    attributes = new {
                      email = user1.Email
                    },
                    relationships = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>() {
                            {"organization", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "organization" },
                                    { "id", Organization.Id.ToString() }
                                }}}},
                        }
                }
            };
            var response = await Post("/api/organization-memberships/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var membership = await Deserialize<OrganizationMembership>(response);

            Assert.Equal(membership.OrganizationId, Organization.Id);
            Assert.Equal(membership.UserId, user1.Id);

            var user = await this.GetDbSet<User>()
                .Include(u => u.UserRoles)
                .Where(u => u.Id == user1.Id)
                .FirstOrDefaultAsync();

            var userRoles = await this.GetDbSet<UserRole>().ToListAsync();

            Assert.Equal(1, user.UserRoles.Count);
        }

        [Fact]
        public async Task Create_AlreadyHasExistingRole()
        {
            BuildTestData();

           var userBefore = await this.GetDbSet<User>()
                .Include(u => u.UserRoles)
                .Where(u => u.Id == user2.Id)
                .FirstOrDefaultAsync();

            Assert.Equal(1, userBefore.UserRoles.Count);

            var content = new
            {
                data = new
                {
                    type = "organization-memberships",
                    attributes = new {
                      email = user2.Email
                    },
                    relationships = new Dictionary<string, Dictionary<string, Dictionary<string, string>>>() {
                            {"organization", new Dictionary<string, Dictionary<string, string>>() {
                                { "data", new Dictionary<string, string>() {
                                    { "type", "organization" },
                                    { "id", Organization.Id.ToString() }
                                }}}},
                        }
                }
            };
            var response = await Post("/api/organization-memberships/", content);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var membership = await Deserialize<OrganizationMembership>(response);

            Assert.Equal(membership.OrganizationId, Organization.Id);
            Assert.Equal(membership.UserId, user2.Id);

            var user = await this.GetDbSet<User>()
                .Include(u => u.UserRoles)
                .Where(u => u.Id == user2.Id)
                .FirstOrDefaultAsync();

            Assert.Equal(1, user.UserRoles.Count);
        }
    }
}
