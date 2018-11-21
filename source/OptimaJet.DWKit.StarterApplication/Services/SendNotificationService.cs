using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using I18Next.Net.Plugins;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Utility;
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class SendNotificationService
    {
        public static IHubContext<ScriptoriaHub> HubContext { get; set; }
        public ITranslator Translator { get; }
        public IJobRepository<Email> EmailRepository { get; }
        public IJobRepository<UserRole> UserRolesRepository { get; }
        public IJobRepository<Notification> NotificationRepository { get; }

        public SendNotificationService(
            ITranslator translator,
            IJobRepository<Email> emailRepository,
            IJobRepository<UserRole> userRolesRepository,
            IJobRepository<Notification> notificationRepository
        )
        {
            Translator = translator;
            EmailRepository = emailRepository;
            UserRolesRepository = userRolesRepository;
            NotificationRepository = notificationRepository;

        }
        public async Task SendNotificationToOrgAdminsAsync(Organization organization, String message, dynamic subs)
        {
            var orgAdmins = UserRolesRepository.Get()
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Where(ur => ur.OrganizationId == organization.Id && ur.Role.RoleName == RoleName.OrganizationAdmin)
                .ToList();
            foreach (UserRole orgAdmin in orgAdmins)
            {
                await SendNotificationToUserAsync(orgAdmin.User, message, subs);
            }
        }
        public async Task SendNotificationToUserAsync(User user, String message, dynamic subs)
        {
            var notification = new Notification
            {
                MessageId = message,
                UserId = user.Id,
                MessageSubstitutions = subs
            };
            var updatedNotification = await NotificationRepository.CreateAsync(notification);
            await HubContext.Clients.User(user.ExternalId).SendAsync("Notification", updatedNotification.Id);
        }
        public void NotificationEmailMonitor()
        {
            // Get limits from environment
            int sendNotificationEmailMinutes = GetIntVarOrDefault("SEND_NOTIFICATION_EMAIL_MINUTES", 60);
            int dontSendNotificationEmailMinutes = GetIntVarOrDefault("DONT_SEND_NOTIFICATION_EMAIL_MINUTES", 180);
            var notifications = NotificationRepository.Get()
                                                    .Where(n => n.DateEmailSent == null && n.DateRead == null)
                                                    .Include(n => n.User)
                                                    .ToList();
            foreach (var notification in notifications)
            {
                if (ShouldSendEmail(notification, sendNotificationEmailMinutes, dontSendNotificationEmailMinutes))
                {
                    SendEmailAsync(notification).Wait();
                }
            }
        }
        protected bool ShouldSendEmail(Notification notification, int beginMinutes, int endMinutes)
        {
            var sendEmail = false;
            var now = DateTime.UtcNow;
            var dateCreated = notification.DateCreated ?? now;
            var elapsedTime = now.Subtract((DateTime)notification.DateCreated).TotalMinutes;
            if (elapsedTime > beginMinutes
                && elapsedTime < endMinutes
                && notification.User.EmailNotification == true)
            {
                sendEmail = true;
            }
            return sendEmail;
        }
        protected async Task SendEmailAsync(Notification notification)
        {
            var locale = CultureInfo.CurrentCulture.Name;
            if (notification.User.Locale != null)
            {
                locale = notification.User.Locale;
            }
            if (String.IsNullOrEmpty(locale))
            {
                locale = "en-US";
            }
            var subject = await Translator.TranslateAsync(locale, "notifications", "notifications.subject", null);
            var subsDict = notification.MessageSubstitutions as Dictionary<string, object>;
            var message = await Translator.TranslateAsync(locale, "notifications", notification.MessageId, subsDict);
            notification.DateEmailSent = DateTime.UtcNow;
            await NotificationRepository.UpdateAsync(notification);
            var email = new Email
            {
                To = notification.User.Email,
                Subject = subject,
                ContentTemplate = "Notification",
                ContentModel = new
                {
                    Message = message
                }
            };
            var result = EmailRepository.CreateAsync(email).Result;
        }
    }
}
