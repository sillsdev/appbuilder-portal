using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using Microsoft.EntityFrameworkCore;
using Moq;
using Newtonsoft.Json;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Services.Notifications
{
    [Collection("BuildEngineCollection")]
    public class NotificationTest : BaseTest<BuildEngineStartup>
    {
        public User CurrentUser { get; set; }
        public Notification notification1 { get; set; }
        public Notification notification2 { get; set; }
        public User user1 { get; private set; }
        public User user2 { get; set; }
        public Organization org1 { get; private set; }
        public Organization org2 { get; private set; }
        public OrganizationMembership orgmember1 { get; set; }
        public OrganizationMembership orgmember2 { get; set; }
        public OrganizationMembership orgmember3 { get; set; }
        public UserRole ur1 { get; set; }
        public UserRole ur2 { get; set; }
        public UserRole ur3 { get; set; }
        public UserRole ur4 { get; set; }
        private void BuildTestData()
        {
            var tuple = NeedsConfiguredCurrentUser();
            CurrentUser = tuple.Item1;
            orgmember1 = tuple.Item2;
            org1 = tuple.Item3;

            var roleSA = AddEntity<AppDbContext, Role>(new Role { RoleName = RoleName.SuperAdmin });
            var roleOA = AddEntity<AppDbContext, Role>(new Role { RoleName = RoleName.OrganizationAdmin });
            var roleAB = AddEntity<AppDbContext, Role>(new Role { RoleName = RoleName.AppBuilder });

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
                ExternalId = "test-auth0-id2",
                Email = "test-email1@test.test",
                Name = "Test Testenson2",
                GivenName = "Test1",
                FamilyName = "Testenson2",
                Locale = "en-US",
                EmailNotification = false
            });
            org2 = AddEntity<AppDbContext, Organization>(new Organization
            {
                OwnerId = CurrentUser.Id,
                Name = "Kalaam Media"
            });
            orgmember2 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = user1.Id,
                OrganizationId = org1.Id
            });
            orgmember3 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = user1.Id,
                OrganizationId = org2.Id
            });
            ur1 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = CurrentUser.Id,
                OrganizationId = org1.Id,
                RoleId = roleSA.Id
            });
            ur2 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = user1.Id,
                OrganizationId = org1.Id,
                RoleId = roleOA.Id
            });
            ur3 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = CurrentUser.Id,
                OrganizationId = org2.Id,
                RoleId = roleSA.Id
            });
            ur4 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = user2.Id,
                OrganizationId = org2.Id,
                RoleId = roleOA.Id
            });

            var notificationParm = new
            {
                orgName = "SIL International",
                url = "http://gtis.guru.com:8443",
                token = "replace"
            };
            var serializedParm = JsonConvert.SerializeObject(notificationParm);
            notification1 = AddEntity<AppDbContext, Notification>(new Notification
            {
                MessageId = "buildengineConnected",
                MessageSubstitutionsJson = serializedParm,
                Message = "Build Engine for organization SIL International status change: connected",
                UserId = user1.Id,
                SendEmail = true
            });
        }
        public NotificationTest(TestFixture<BuildEngineStartup> fixture) : base(fixture)
        {

        }

        [Fact]
        public async Task TestSendNotificationToUser()
        {
            BuildTestData();
            var notificationParm = new Dictionary<string, object>()
            {
                { "orgName", "SIL International" },
                { "url", "http://gtis.guru.com:8443" },
                { "token", "replace" }
            };

            var sendNotificationService = _fixture.GetService<SendNotificationService>();
            await sendNotificationService.SendNotificationToUserAsync(CurrentUser, "buildengineConnected", notificationParm);
            var modifiedNotifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, modifiedNotifications.Count);
            Assert.Equal("Build Engine for organization SIL International status change: connected", modifiedNotifications[1].Message);
        }
        [Fact]
        public async Task TestSendNotificationToOwnerAndAdmin()
        {
            BuildTestData();
            var backgroundJobClient = _fixture.GetService<IBackgroundJobClient>();
            var backgroundJobClientMock = Mock.Get(backgroundJobClient);

            var notificationParm = new Dictionary<string, object>()
            {
                { "orgName", "SIL International" },
                { "url", "http://gtis.guru.com:8443" },
                { "token", "replace" }
            };

            var sendNotificationService = _fixture.GetService<SendNotificationService>();
            await sendNotificationService.SendNotificationToOrgAdminsAndOwnerAsync(org1, CurrentUser, "buildengineConnected", notificationParm);
            var modifiedNotifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(3, modifiedNotifications.Count);
            Assert.Equal("Build Engine for organization SIL International status change: connected", modifiedNotifications[1].Message);
            backgroundJobClientMock.Verify(x => x.Create(
                It.Is<Job>(job =>
                           job.Method.Name == "SendEmailNotificationImmediate" &&
                           job.Type == typeof(SendNotificationService)),
                It.IsAny<EnqueuedState>()));
        }
        [Fact]
        public async Task TestSendNotificationToOwnerAndAdminSameUser()
        {
            BuildTestData();
            var notificationParm = new Dictionary<string, object>()
            {
                { "orgName", "SIL International" },
                { "url", "http://gtis.guru.com:8443" },
                { "token", "replace" }
            };

            var sendNotificationService = _fixture.GetService<SendNotificationService>();
            await sendNotificationService.SendNotificationToOrgAdminsAndOwnerAsync(org1, user1, "buildengineConnected", notificationParm);
            var modifiedNotifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, modifiedNotifications.Count);
            Assert.Equal("Build Engine for organization SIL International status change: connected", modifiedNotifications[1].Message);

        }
        [Fact]
        public async Task TestSendDifferentNotificationToOwnerAndAdmin()
        {
            BuildTestData();
            var link = "http://gtis.guru.com:8443";
            var notificationParm = new Dictionary<string, object>()
            {
                { "productName", "scriptureAppBuilder"},
                { "projectName", "Test Project"},
                { "buildStatus", "failure"},
                { "buildEngineUrl", link }
            };

            var sendNotificationService = _fixture.GetService<SendNotificationService>();
            await sendNotificationService.SendNotificationToOrgAdminsAndOwnerAsync(org1, CurrentUser, "buildFailedOwner", "buildFailedAdmin", notificationParm, link);
            var modifiedNotifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(3, modifiedNotifications.Count);
            // Verify admin message
            Assert.Equal("Build for product scriptureAppBuilder project Test Project failed. Status: failure  Review status at build engine http://gtis.guru.com:8443 for details", modifiedNotifications[1].Message);
            Assert.Equal("http://gtis.guru.com:8443", modifiedNotifications[1].LinkUrl);
            // Verify user message
            Assert.Equal("Build for product scriptureAppBuilder project Test Project failed. Status: failure The organization administrator has been notified of this issue.", modifiedNotifications[2].Message);
            Assert.Equal("http://gtis.guru.com:8443", modifiedNotifications[2].LinkUrl);
        }
        [Fact]
        public async Task TestSlashInProjectName()
        {
            BuildTestData();
            var link = "http://gtis.guru.com:8443";
            var notificationParm = new Dictionary<string, object>()
            {
                { "productName", "scriptureAppBuilder"},
                { "projectName", "Test Project 4/12"},
                { "buildStatus", "failure"},
                { "buildEngineUrl", link }
            };

            var sendNotificationService = _fixture.GetService<SendNotificationService>();
            await sendNotificationService.SendNotificationToOrgAdminsAndOwnerAsync(org1, CurrentUser, "buildFailedOwner", "buildFailedAdmin", notificationParm, link);
            var modifiedNotifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(3, modifiedNotifications.Count);
            // Verify admin message
            Assert.Equal("Build for product scriptureAppBuilder project Test Project 4/12 failed. Status: failure  Review status at build engine http://gtis.guru.com:8443 for details", modifiedNotifications[1].Message);
            Assert.Equal("http://gtis.guru.com:8443", modifiedNotifications[1].LinkUrl);
            // Verify user message
            Assert.Equal("Build for product scriptureAppBuilder project Test Project 4/12 failed. Status: failure The organization administrator has been notified of this issue.", modifiedNotifications[2].Message);
            Assert.Equal("http://gtis.guru.com:8443", modifiedNotifications[2].LinkUrl);
        }

        [Fact]
        public async Task Test_Multiple_Substitutions()
        {
            BuildTestData();
            var notificationParm = new Dictionary<string, object>()
            {
                { "orgName", "SIL International" },
                { "projectName", "Test project" }
            };
            var sendNotificationService = _fixture.GetService<SendNotificationService>();
            await sendNotificationService.SendNotificationToUserAsync(CurrentUser, "projectFailedBuildEngine", notificationParm);
            var modifiedNotifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, modifiedNotifications.Count);
            Assert.Equal("Failed to create project Test project. Could not connect to build engine for organization SIL International.", modifiedNotifications[1].Message);
        }
        [Fact]
        public async Task Test_OrgAdmin_Receives_Email()
        {
            BuildTestData();
            var notificationParm = new Dictionary<string, object>()
            {
                { "orgName", "SIL International" },
                { "projectName", "Test project" }
            };
            var sendNotificationService = _fixture.GetService<SendNotificationService>();
            await sendNotificationService.SendNotificationToOrgAdminsAsync(org1, "projectFailedBuildEngine", notificationParm);
            var modifiedNotifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, modifiedNotifications.Count);
            var notification = modifiedNotifications[1];
            Assert.True(notification.SendEmail);
            Assert.Equal(user1.Id, notification.UserId);
        }
        [Fact]
        public async Task Test_OrgAdmin_Receives_Email_With_User_Notification_False()
        {
            BuildTestData();
            var notificationParm = new Dictionary<string, object>()
            {
                { "orgName", "SIL International" },
                { "projectName", "Test project" }
            };
            var sendNotificationService = _fixture.GetService<SendNotificationService>();
            await sendNotificationService.SendNotificationToOrgAdminsAsync(org2, "projectFailedBuildEngine", notificationParm);
            var modifiedNotifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, modifiedNotifications.Count);
            var notification = modifiedNotifications[1];
            Assert.True(notification.SendEmail);
            Assert.Equal(user2.Id, notification.UserId);
        }

        [Fact]
        public async Task Test_SuperAdmin_Does_Not_Receive_Email()
        {
            BuildTestData();
            var startNotifications = ReadTestData<AppDbContext, Notification>();
            Assert.Single(startNotifications);

            var userRolesRepository = _fixture.GetService<IJobRepository<UserRole>>();
            var userRoles = userRolesRepository.Get()
                //.Include(ur => ur.User)
                .Include(ur => ur.Role)
                .ToList();
            Assert.Equal(4, userRoles.Count);

            var notificationParm = new Dictionary<string, object>()
            {
                { "orgName", "SIL International" },
                { "projectName", "Test project" }
            };
            var sendNotificationService = _fixture.GetService<SendNotificationService>();
            await sendNotificationService.SendNotificationToSuperAdminsAsync("projectFailedBuildEngine", notificationParm, "", false);
            var modifiedNotifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, modifiedNotifications.Count);
            var notification = modifiedNotifications[1];
            Assert.False(notification.SendEmail);
            Assert.Equal(CurrentUser.Id, notification.UserId);
        }
    }
}
