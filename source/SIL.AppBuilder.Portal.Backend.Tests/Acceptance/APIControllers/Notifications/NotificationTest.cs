using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support.TestClasses;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Notifications
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
        public UserRole ur1 { get; set; }
        public UserRole ur2 { get; set; }

        private void BuildTestData()
        {
            NeedsRoles();
            var tuple = NeedsConfiguredCurrentUser();
            CurrentUser = tuple.Item1;
            orgmember1 = tuple.Item2;
            org1 = tuple.Item3;

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
            orgmember2 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = user1.Id,
                OrganizationId = org1.Id
            });
            ur1 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = CurrentUser.Id,
                OrganizationId = org1.Id,
                RoleId = 1
            });
            ur2 = AddEntity<AppDbContext, UserRole>(new UserRole
            {
                UserId = user1.Id,
                OrganizationId = org1.Id,
                RoleId = 2
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
                MessageId = "notifications.buildengineConnected",
                UserId = user1.Id,
                MessageSubstitutionsJson = serializedParm,
            });
            notification2 = new Notification
            {
                MessageId = "notifications.buildengineConnected",
                UserId = user1.Id,
                User = user1,
                MessageSubstitutionsJson = serializedParm,
                DateCreated = DateTime.UtcNow.AddMinutes(-100),
                DateUpdated = DateTime.UtcNow.AddMinutes(-100)
            };
        }
        public NotificationTest(TestFixture<BuildEngineStartup> fixture) : base(fixture)
        {

        }

        [Fact]
        public void Create_Notification_Object()
        {
            var substitutions = "{\"parm1\":\"sub1\",\"parm2\":\"sub2\",\"parm3\":\"sub3\"}";
            var subObject = new { parm1 = "sub1", parm2 = "sub2", parm3 = "sub3" };
            var notification = new Notification
            {
                MessageId = "test:subset1",
                DateCreated = DateTime.UtcNow
            };

            notification.MessageSubstitutionsJson = substitutions;
            var deserializedSubstitutions = notification.MessageSubstitutionsJson;
            Assert.Equal(substitutions, deserializedSubstitutions);
            var data = notification.MessageSubstitutions as Dictionary<string, object>;
            Assert.Equal("sub1", data["parm1"]);
            Assert.Equal("sub2", data["parm2"]);
            Assert.Equal("sub3", data["parm3"]);

            notification.MessageSubstitutions = subObject;
            var deserializedSubstitutions2 = notification.MessageSubstitutionsJson;
            Assert.Equal(substitutions, deserializedSubstitutions2);
        }
        [Fact]
        public async Task TestSendNotificationToUser()
        {
            BuildTestData();
            var notificationParm = new
            {
                orgName = "SIL International",
                url = "http://gtis.guru.com:8443",
                token = "replace"
            };

            var sendNotificationService = _fixture.GetService<SendNotificationServiceTester>();
            await sendNotificationService.SendNotificationToUserAsync(CurrentUser, "notifications.buildengineConnected", notificationParm);
            var modifiedNotifications = ReadTestData<AppDbContext, Notification>();
            Assert.Equal(2, modifiedNotifications.Count);
            var a = modifiedNotifications[1].MessageSubstitutionsJson;
            Assert.Equal("{\"orgName\":\"SIL International\",\"url\":\"http://gtis.guru.com:8443\",\"token\":\"replace\"}", modifiedNotifications[1].MessageSubstitutionsJson);
        }
        [Fact]
        public async Task Send_EmailAsync()
        {
            BuildTestData();
            var sendNotificationService = _fixture.GetService<SendNotificationServiceTester>();
            var notifications = ReadTestData<AppDbContext, Notification>();
            await sendNotificationService.SendEmailTest(notifications[0]);
            var modifiedNotifications = ReadTestData<AppDbContext, Notification>();
            Assert.Single(modifiedNotifications);
            var notification = modifiedNotifications[0];
            Assert.NotNull(notification.DateEmailSent);
            var emails = ReadTestData<AppDbContext, Email>();
            Assert.Single(emails);
            var email = emails[0];
            Assert.Equal("[Scriptoria] Test Notification", email.Subject);
            Assert.Equal("{\"Message\":\"Build Engine for organization SIL International status change: connected\"}", email.ContentModelJson);
        }
        [Fact]
        public async Task Test_Multiple_Substitutions()
        {
            BuildTestData();
            var notificationParm = new
            {
                orgName = "SIL International",
                projectName = "Test project"
            };
            var serializedParm = JsonConvert.SerializeObject(notificationParm);
            var notification3 = AddEntity<AppDbContext, Notification>(new Notification
            {
                MessageId = "notifications.projectFailedBuildEngine",
                UserId = user1.Id,
                MessageSubstitutionsJson = serializedParm,
            });
            var sendNotificationService = _fixture.GetService<SendNotificationServiceTester>();
            var notifications = ReadTestData<AppDbContext, Notification>();
            await sendNotificationService.SendEmailTest(notifications[1]);
            var modifiedNotifications = ReadTestData<AppDbContext, Notification>();
            var emails = ReadTestData<AppDbContext, Email>();
            Assert.Single(emails);
            var email = emails[0];
            Assert.Equal("[Scriptoria] Test Notification", email.Subject);
            Assert.Equal("{\"Message\":\"Failed to create project Test project. Could not connect to build engine for organization SIL International.\"}", email.ContentModelJson);
        }
    }
}
