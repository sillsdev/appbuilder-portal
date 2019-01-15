using System;
using System.Collections.Generic;
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
        public IHubContext<ScriptoriaHub> HubContext { get; }
        public ITranslator Translator { get; }
        public IJobRepository<Email> EmailRepository { get; }
        public IJobRepository<UserRole> UserRolesRepository { get; }
        public IJobRepository<Notification> NotificationRepository { get; }

        public SendNotificationService(
            ITranslator translator,
            IJobRepository<Email> emailRepository,
            IJobRepository<UserRole> userRolesRepository,
            IHubContext<ScriptoriaHub> hubContext,
            IJobRepository<Notification> notificationRepository
        )
        {
            Translator = translator;
            EmailRepository = emailRepository;
            UserRolesRepository = userRolesRepository;
            NotificationRepository = notificationRepository;
            HubContext = hubContext;

        }
        public async Task SendNotificationToOrgAdminsAndOwnerAsync(Organization organization, User owner, String messageId, Dictionary<string, object> subs)
        {
            await SendNotificationToOrgAdminsAsync(organization, messageId, subs);
            await SendNotificationToUserAsync(owner, messageId, subs, false);
        }
        public async Task SendNotificationToOrgAdminsAsync(Organization organization, String messageId, Dictionary<string, object> subs)
        {
            var orgAdmins = UserRolesRepository.Get()
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Where(ur => ur.OrganizationId == organization.Id && ur.Role.RoleName == RoleName.OrganizationAdmin)
                .ToList();
            foreach (UserRole orgAdmin in orgAdmins)
            {
                await SendNotificationToUserAsync(orgAdmin.User, messageId, subs, true);
            }
        }
        public async Task SendNotificationToSuperAdminsAsync(String messageId, Dictionary<string, object> subs)
        {
            var superAdmins = UserRolesRepository.Get()
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Where(ur => ur.Role.RoleName == RoleName.SuperAdmin)
                .ToList();
            foreach (UserRole superAdmin in superAdmins)
            {
                await SendNotificationToUserAsync(superAdmin.User, messageId, subs, true);
            }
        }
        public async Task SendNotificationToUserAsync(User user, String messageId, Dictionary<string, object> subs, bool sendEmailOverride = false)
        {
            var locale = user.LocaleOrDefault();
            var fullMessageId = "notifications.notification." + messageId;
            var translated = await Translator.TranslateAsync(locale, "notifications", fullMessageId, subs);
            var sendEmail = true;
            if (!sendEmailOverride && (user.EmailNotification != null))
            {
                sendEmail = (bool)user.EmailNotification;
            }
            var notification = new Notification
            {
                UserId = user.Id,
                Message = translated,
                SendEmail = sendEmail,
                MessageSubstitutions = subs,
                MessageId = messageId
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
            var fullBodyId = "notifications.body." + notification.MessageId;
            var fullSubjectId = "notifications.subject." + notification.MessageId;
            var subsDict = notification.MessageSubstitutions as Dictionary<string, object>;
            var subject = await Translator.TranslateAsync(locale, "notifications", fullSubjectId, subsDict);
            var body = await Translator.TranslateAsync(locale, "notifications", fullBodyId, subsDict);
            notification.DateEmailSent = DateTime.UtcNow;
            await NotificationRepository.UpdateAsync(notification);
            var email = new Email
            {
                To = notification.User.Email,
                Subject = subject,
                ContentTemplate = "Notification.txt",
                ContentModel = new
                {
                    Message = body
                }
            };
            var result = await EmailRepository.CreateAsync(email);
        }
    }
}
