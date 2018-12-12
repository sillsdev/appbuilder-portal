using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using I18Next.Net.Plugins;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Utility;
using OptimaJet.DWKit.StarterApplication.Utility.Extensions;
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
        public async Task SendNotificationToOrgAdminsAndOwnerAsync(Organization organization, User owner, String message, Dictionary<string, object> subs)
        {
            await SendNotificationToOrgAdminsAsync(organization, message, subs);
            await SendNotificationToUserAsync(owner, message, subs, false);
        }
        public async Task SendNotificationToOrgAdminsAsync(Organization organization, String message, Dictionary<string, object> subs)
        {
            var orgAdmins = UserRolesRepository.Get()
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Where(ur => ur.OrganizationId == organization.Id && ur.Role.RoleName == RoleName.OrganizationAdmin)
                .ToList();
            foreach (UserRole orgAdmin in orgAdmins)
            {
                await SendNotificationToUserAsync(orgAdmin.User, message, subs, true);
            }
        }
        public async Task SendNotificationToSuperAdminsAsync(String message, Dictionary<string, object> subs)
        {
            var superAdmins = UserRolesRepository.Get()
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Where(ur => ur.Role.RoleName == RoleName.SuperAdmin)
                .ToList();
            foreach (UserRole superAdmin in superAdmins)
            {
                await SendNotificationToUserAsync(superAdmin.User, message, subs, true);
            }
        }
        public async Task SendNotificationToUserAsync(User user, String message, Dictionary<string, object> subs, bool sendEmailOverride = false)
        {
            var locale = user.LocaleOrDefault();
            var translated = await Translator.TranslateAsync(locale, "notifications", message, subs);
            var sendEmail = true;
            if (!sendEmailOverride && (user.EmailNotification != null))
            {
                sendEmail = (bool)user.EmailNotification;
            }
            var notification = new Notification
            {
                UserId = user.Id,
                Message = translated,
                SendEmail = sendEmail
            };
            var updatedNotification = await NotificationRepository.CreateAsync(notification);
            await HubContext.Clients.User(user.ExternalId).SendAsync("Notification", updatedNotification.Id);
        }
        public void NotificationEmailMonitor()
        {
            // Get limits from environment
            int sendNotificationEmailMinutes = GetIntVarOrDefault("NOTIFICATION_SEND_EMAIL_MIN_MINUTES", 60);
            int dontSendNotificationEmailMinutes = GetIntVarOrDefault("NOTIFICATION_SEND_EMAIL_MAX_MINUTES", 180);
            var now = DateTime.UtcNow;
            var notifications = NotificationRepository.Get()
                                                    .Where(n => n.DateEmailSent == null
                                                           && n.DateRead == null
                                                           && n.SendEmail == true
                                                           && now.Subtract((DateTime)n.DateCreated).TotalMinutes > sendNotificationEmailMinutes
                                                           && now.Subtract((DateTime)n.DateCreated).TotalMinutes < dontSendNotificationEmailMinutes
                                                          )
                                                    .Include(n => n.User)
                                                    .ToList();
            foreach (var notification in notifications)
            {
                SendEmailAsync(notification).Wait();
            }
        }

        protected async Task SendEmailAsync(Notification notification)
        {
            var locale = notification.User.LocaleOrDefault();
            var subject = await Translator.TranslateAsync(locale, "notifications", "notifications.subject", null);
            notification.DateEmailSent = DateTime.UtcNow;
            await NotificationRepository.UpdateAsync(notification);
            var email = new Email
            {
                To = notification.User.Email,
                Subject = subject,
                ContentTemplate = "Notification",
                ContentModel = new
                {
                    Message = notification.Message
                }
            };
            var result = EmailRepository.CreateAsync(email).Result;
        }
    }
}
