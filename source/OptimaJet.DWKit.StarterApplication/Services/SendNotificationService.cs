using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Hangfire;
using I18Next.Net.Plugins;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Utility;
using Serilog;
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class SendNotificationService
    {
        public ITranslator Translator { get; }
        public IJobRepository<Email> EmailRepository { get; }
        public IJobRepository<UserRole> UserRolesRepository { get; }
        public SendEmailService SendEmailService { get; }
        public IBackgroundJobClient BackgroundJobClient { get; }
        public IJobRepository<Notification> NotificationRepository { get; }

        public SendNotificationService(
            ITranslator translator,
            IJobRepository<Email> emailRepository,
            IJobRepository<UserRole> userRolesRepository,
            SendEmailService sendEmailService,
            IBackgroundJobClient backgroundJobClient,
            IJobRepository<Notification> notificationRepository
        )
        {
            Translator = translator;
            EmailRepository = emailRepository;
            UserRolesRepository = userRolesRepository;
            SendEmailService = sendEmailService;
            BackgroundJobClient = backgroundJobClient;
            NotificationRepository = notificationRepository;

        }
        public async Task SendNotificationToOrgAdminsAndOwnerAsync(Organization organization, User owner, String messageId, Dictionary<string, object> subs, String linkUrl = "")
        {
            await SendNotificationToOrgAdminsAndOwnerAsync(organization, owner, messageId, messageId, subs, linkUrl);
            return;
        }
        public async Task SendNotificationToOrgAdminsAndOwnerAsync(Organization organization, User owner, String ownerMessageId, String orgAdminMessageId, Dictionary<string, object> subs, String linkUrl = "")
        {
            var sentNotifictionToOwner = await SendNotificationToOrgAdminsAsync(organization, orgAdminMessageId, subs, linkUrl, owner.Id);
            // Don't resend notification to owner if they already received one as an org admin
            if (!sentNotifictionToOwner)
            {
                await SendNotificationToUserAsync(owner, ownerMessageId, subs, linkUrl, null, true);
            }
        }
        public async Task<bool> SendNotificationToOrgAdminsAsync(Organization organization, String messageId, Dictionary<string, object> subs, String linkUrl = "", int ownerId = 0)
        {
            var sentNotificationToOwner = false;
            var orgAdmins = UserRolesRepository.Get()
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Where(ur => ur.OrganizationId == organization.Id && ur.Role.RoleName == RoleName.OrganizationAdmin)
                .ToList();
            foreach (UserRole orgAdmin in orgAdmins)
            {
                if (orgAdmin.UserId == ownerId)
                {
                    sentNotificationToOwner = true;
                }
                await SendNotificationToUserAsync(orgAdmin.User, messageId, subs, linkUrl, true, true);
            }
            return sentNotificationToOwner;
        }
        public async Task SendNotificationToSuperAdminsAsync(String messageId, Dictionary<string, object> subs, String linkUrl = "", bool? forceEmail = true)
        {
            var superAdmins = UserRolesRepository.Get()
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Where(ur => ur.Role.RoleName == RoleName.SuperAdmin)
                .Select(ur => ur.User)
                .ToList();
            foreach (User superAdmin in superAdmins.Distinct(new IdentifiableComparer()))
            {
                await SendNotificationToUserAsync(superAdmin, messageId, subs, linkUrl, forceEmail);
            }
        }
        // forceEmail set to false sends notification with no email.  Set forceEmail to null to not force either way
        public async Task SendNotificationToUserAsync(User user, String messageId, Dictionary<string, object> subs, String linkUrl = "", bool? forceEmail = null, bool sendEmailImmediately = false)
        {
            var locale = user.LocaleOrDefault();
            var fullMessageId = "notifications.notification." + messageId;
            var translated = await Translator.TranslateAsync(locale, "notifications", fullMessageId, subs);
            translated = HttpUtility.HtmlDecode(translated);
            var sendEmail = !user.EmailNotification.HasValue || user.EmailNotification.Value;
            if (forceEmail.HasValue)
            {
                sendEmail = forceEmail.Value;
            }

            var notification = new Notification
            {
                UserId = user.Id,
                Message = translated,
                SendEmail = sendEmail,
                MessageSubstitutions = subs,
                MessageId = messageId,
                LinkUrl = linkUrl
            };
            var updatedNotification = await NotificationRepository.CreateAsync(notification);
            if (sendEmailImmediately)
            {
                BackgroundJobClient.Enqueue<SendNotificationService>(service => service.SendEmailNotificationImmediate(updatedNotification.Id));
            }
        }

        public void SendEmailNotificationImmediate(int id)
        {
            SendEmailNotificationImmediateAsync(id).Wait();
        }

        public async Task SendEmailNotificationImmediateAsync(int id)
        {
            var notification = await NotificationRepository.Get()
                .Where(not => not.Id == id)
                .Include(not => not.User).FirstOrDefaultAsync();

            if (notification == null)
            {
                var messageParms = new Dictionary<string, object>
                {
                    { "taskName", "SendEmailNotificationImmediate" },
                    { "recordName", "Notification"},
                    { "recordId", id }
                };
                await SendNotificationToSuperAdminsAsync("recordNotFound", messageParms);

                return;
            }

            await SendEmailNotificationAsync(notification);
        }


        public void NotificationEmailMonitor()
        {
            // Get limits from environment
            int sendNotificationEmailMinutes = GetIntVarOrDefault("NOTIFICATION_SEND_EMAIL_MIN_MINUTES", 60);
            int dontSendNotificationEmailMinutes = GetIntVarOrDefault("NOTIFICATION_SEND_EMAIL_MAX_MINUTES", 180);
            var now = DateTime.UtcNow;
            var oldestCreationDateToSend = now.AddMinutes(-dontSendNotificationEmailMinutes);
            var latestCreationDateToSend = now.AddMinutes(-sendNotificationEmailMinutes);
            Log.Information($"NotificationsEmailMonitor: Latest={latestCreationDateToSend.ToString()}, Earliest={oldestCreationDateToSend.ToString()}, Now={now.ToString()}");
            var notifications = NotificationRepository.Get()
                                                    .Where(n => n.DateEmailSent == null
                                                           && n.DateRead == null
                                                           && n.SendEmail == true
                                                           && n.DateCreated < latestCreationDateToSend
                                                           && n.DateCreated > oldestCreationDateToSend
                                                          )
                                                    .Include(n => n.User)
                                                    .ToList();
            foreach (var notification in notifications)
            {
                SendEmailNotificationAsync(notification).Wait();
            }
        }

        private async Task SendEmailNotificationAsync(Notification notification)
        {
            Log.Information($"Send Email Notification {notification.Id} to {notification.User.Email}: {notification.Message}");
            await SendEmailService.SendNotificationEmailAsync(notification);
            notification.DateEmailSent = DateTime.UtcNow;
            await NotificationRepository.UpdateAsync(notification);
        }
    }
}
