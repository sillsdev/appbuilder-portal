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
        protected readonly FluentEmail.Core.Interfaces.ISender sender;
        protected readonly IJobRepository<Email> emailRepository;
        protected readonly FluentEmail.Core.IFluentEmailFactory emailFactory;
        protected readonly IClient bugsnagClient;

        public EmailService( 
            IJobRepository<Email> emailRepository,
            FluentEmail.Core.IFluentEmailFactory emailFactory,
            IClient bugsnagClient,
            FluentEmail.Core.Interfaces.ISender sender)
        {
            this.emailRepository = emailRepository;
            this.emailFactory = emailFactory;
            this.bugsnagClient = bugsnagClient;
            this.sender = sender;
        }

        public void Process(EmailServiceData data)
        {
            var email = emailRepository.GetAsync(data.Id).Result;

            if (string.IsNullOrWhiteSpace(email.To) &&
                string.IsNullOrWhiteSpace(email.Cc) &&
                string.IsNullOrWhiteSpace(email.Bcc))
            {
                // Creating an Exception to report to BugSnag.  Don't want to Retry.
                var ex = new Exception($"Email id={data.Id}: Didn't have To, Cc, or Bcc. Cancel Send.");
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
    }
}
