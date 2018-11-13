using System.Threading.Tasks;
using I18Next.Net.Plugins;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support.TestClasses
{
    public class SendNotificationServiceTester : SendNotificationService
    {
        public SendNotificationServiceTester(
            ITranslator translator,
            IJobRepository<Email> emailRepository,
            IJobRepository<UserRole> userRolesRepository,
            IJobRepository<Notification> notificationRepository
        ) : base(translator, emailRepository, userRolesRepository, notificationRepository)
        {
        }
        public async Task SendEmailTest(Notification notification)
        {
            await base.SendEmailAsync(notification);
            return;
        }
        public bool ShouldSendEmailTest(Notification notification, int beginMinutes, int endMinutes)
        {
            return base.ShouldSendEmail(notification, beginMinutes, endMinutes);
        }
    }
}
