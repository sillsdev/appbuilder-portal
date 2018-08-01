using System;
using System.IO;
using Bugsnag;
using Hangfire;
using Microsoft.Extensions.Options;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class EmailService : IEmailService
    {
        protected readonly EmailSettings settings;
        protected readonly FluentEmail.Core.Interfaces.ISender sender;
        protected readonly IBackgroundRepository<Email> emailRepository;
        protected readonly FluentEmail.Core.IFluentEmailFactory emailFactory;
        protected readonly IClient bugsnagClient;

        public EmailService( 
            IBackgroundRepository<Email> emailRepository,
            IOptions<EmailSettings> options,
            FluentEmail.Core.IFluentEmailFactory emailFactory,
            IClient bugsnagClient,
            FluentEmail.Core.Interfaces.ISender sender)
        {
            this.emailRepository = emailRepository;
            this.emailFactory = emailFactory;
            this.bugsnagClient = bugsnagClient;
            this.settings = options.Value;
            this.sender = sender;
        }

        public void Process(EmailServiceData data)
        {
            Email email = null;
            try
            {
                email = emailRepository.GetAsync(data.Id).Result;
                if (email == null) {
                    Log.Error($"Email id={data.Id} not found! Ignoring");
                    return;
                }

                if (string.IsNullOrWhiteSpace(email.To) &&
                    string.IsNullOrWhiteSpace(email.Cc) &&
                    string.IsNullOrWhiteSpace(email.Bcc))
                {
                    var ex = new Exception($"Email id={data.Id}: Didn't have To, Cc, or Bcc");
                    Log.Error(ex, "Failed checking To, CC, BCC before sending. Cancel send.");
                    bugsnagClient.Notify(ex);
                    return;
                }

                var templateFile = $"{Directory.GetCurrentDirectory()}/Templates/{email.ContentTemplate}.cshtml";
                var fluentEmail = emailFactory.Create()
                    .To(email.To)
                    .CC(email.Cc)
                    .BCC(email.Bcc)
                    .Subject(email.Subject)
                    .UsingTemplateFromFile(templateFile, email.ContentModel);
                this.sender.Send(fluentEmail);
            }
            catch (Exception ex)
            {
                if (data.AttemptCount < settings.MaxEmailAttempts)
                {
                    // Re-attempt with incremental backoff
                    data.AttemptCount = data.AttemptCount + 1;
                    BackgroundJob.Schedule<IEmailService>(service => service.Process(data), TimeSpan.FromMinutes(data.AttemptCount * 2));
                }
                Log.Error(ex, $"Failed to send email: id={data.Id}");
                bugsnagClient.Notify(ex);
            }
        }
    }
}
