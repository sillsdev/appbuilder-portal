using System.Threading.Tasks;
using I18Next.Net.Plugins;
using Microsoft.AspNetCore.SignalR;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support.TestClasses
{
    public class SendNotificationServiceTester : SendNotificationService
    {
        public SendNotificationServiceTester(
            ITranslator translator,
            IJobRepository<Email> emailRepository,
            IJobRepository<UserRole> userRolesRepository,
            IJobRepository<Notification> notificationRepository,
            IHubContext<ScriptoriaHub> hubContext
        ) : base(translator, emailRepository, userRolesRepository, hubContext, notificationRepository)
        {
        }
        public async Task SendEmailTest(Notification notification)
        {
            await base.SendEmailAsync(notification);
            return;
        }
    }
}
