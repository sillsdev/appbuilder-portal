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
    [Collection("BuildEngineCollection")]
    public class CreateOrganizationInviteTest : BaseTest<BuildEngineStartup>
    {
        public CreateOrganizationInviteTest(TestFixture<BuildEngineStartup> fixture) : base(fixture)
        {
            BuildTestData();
        }

        public User SuperAdmin { get; set; }
        public User user1 { get; set; }
        public User user2 { get; set; }
        public OrganizationInviteRequest invite1 { get; set; }
        public Role roleSA { get; set; }
        private void BuildTestData()
        {
            // Email Notification defaults to true for this user
            SuperAdmin = NeedsCurrentUser();

            roleSA = AddEntity<AppDbContext, Role>(new Role
            {
                RoleName = RoleName.SuperAdmin
            });

            user1 = AddEntity<AppDbContext, User>(new User
            {
                ExternalId = "test-auth0-id1",
                Email = "test-email1@test.test",
                Name = "Test Testenson1",
                GivenName = "Test1",
                FamilyName = "Testenson1",
                Locale = "en-US",
                EmailNotification = true
            });
            user2 = AddEntity<AppDbContext, User>(new User
            {
                ExternalId = "test-auth0-id1",
                Email = "test-email2@test.test",
                Name = "Test Testenson1",
                GivenName = "Test1",
                FamilyName = "Testenson1",
                Locale = "en-US",
                EmailNotification = false
            });
            invite1 = AddEntity<AppDbContext, OrganizationInviteRequest>(new OrganizationInviteRequest
            {
                Name = "some name",
                OrgAdminEmail ="test@gmail.com",
                WebsiteUrl = "http://www.testweb.com"
            });

            NeedsTestData<AppDbContext, UserRole>(new List<UserRole> {
                new UserRole { User = SuperAdmin, RoleId = roleSA.Id },
                new UserRole { User = user1, RoleId = roleSA.Id },
                new UserRole { User = user2, RoleId = roleSA.Id },
            });
       
        }

        [Fact]
        public void Create_Succeeds_for_SuperAdmin()
        {
            var request = new OrganizationInviteRequestServiceData
            {
                Id = invite1.Id
            };
            var organizationInviteService = _fixture.GetService<IOrganizationInviteRequestService>();

            organizationInviteService.Process(request);

            var emails = ReadTestData<AppDbContext, Email>();
            Assert.Equal(2, emails.Count);
            var invites = ReadTestData<AppDbContext, OrganizationInviteRequest>();
            Assert.Empty(invites);
            var email1 = emails[0];
            Assert.Equal("test-email@test.test", email1.To);
            Assert.Equal("[Scriptoria] Organization Invite Request", email1.Subject);
            var email2 = emails[1];
            Assert.Equal("test-email1@test.test", email2.To);
            Assert.Equal("[Scriptoria] Organization Invite Request", email2.Subject);
        }
    }
}

