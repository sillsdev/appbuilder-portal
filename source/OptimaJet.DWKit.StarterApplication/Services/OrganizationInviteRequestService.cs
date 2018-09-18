using System;
using Bugsnag;
using Hangfire;
using Microsoft.Extensions.Options;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class OrganizationInviteRequestService : IOrganizationInviteRequestService
    {
        protected readonly IJobRepository<OrganizationInviteRequest> requestRepository;
        protected readonly IJobRepository<Email> emailRepository;
        protected readonly OrganizationInviteRequestSettings settings;
        protected readonly IClient bugsnagClient;
        public OrganizationInviteRequestService(
            IOptions<OrganizationInviteRequestSettings> options,
            IJobRepository<OrganizationInviteRequest> requestRepository,
            IJobRepository<Email> emailRepository,
            IClient bugsnagClient)
        {
            this.requestRepository = requestRepository;
            this.emailRepository = emailRepository;
            this.bugsnagClient = bugsnagClient;
            this.settings = options.Value;
        }

        public void Process(OrganizationInviteRequestServiceData data)
        {
            var request = requestRepository.GetAsync(data.Id).Result;
            var email = new Email
            {
                // TODO: Query Users for Super Admins
                To = settings.SuperAdminEmail,
                // TODO: Get localized Subject and Template
                Subject = "[Scriptoria] Organization Invite Request",
                ContentTemplate = "OrganizationInviteRequest",
                ContentModel = new
                {
                    request.Name,
                    request.OrgAdminEmail,
                    request.WebsiteUrl,
                    BaseUrl = settings.BaseUrl
                }
            };
            var result = emailRepository.CreateAsync(email).Result;
            requestRepository.DeleteAsync(request.Id);
        }
    }
}
