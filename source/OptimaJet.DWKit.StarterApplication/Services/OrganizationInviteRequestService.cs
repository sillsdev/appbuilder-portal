using System;
using System.Linq;
using Bugsnag;
using Hangfire;
using I18Next.Net.Plugins;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class OrganizationInviteRequestService : IOrganizationInviteRequestService
    {
        private readonly ITranslator translator;
        protected readonly IJobRepository<OrganizationInviteRequest> requestRepository;
        protected readonly IJobRepository<Email> emailRepository;
        private readonly IJobRepository<UserRole> userRolesRepository;
        protected readonly OrganizationInviteRequestSettings settings;
        public OrganizationInviteRequestService(
            ITranslator translator,
            IOptions<OrganizationInviteRequestSettings> options,
            IJobRepository<OrganizationInviteRequest> requestRepository,
            IJobRepository<Email> emailRepository,
            IJobRepository<UserRole> userRolesRepository)
        {
            this.translator = translator;
            this.requestRepository = requestRepository;
            this.emailRepository = emailRepository;
            this.userRolesRepository = userRolesRepository;
            this.settings = options.Value;
        }

        public void Process(OrganizationInviteRequestServiceData data)
        {
            var request = requestRepository.GetAsync(data.Id).Result;
            var superAdmins = userRolesRepository.Get()
                .Include(ur => ur.User)
                .Include(ur => ur.Role)
                .Where(ur =>  ur.Role.RoleName == RoleName.SuperAdmin)
                .ToList();
            foreach (UserRole superAdmin in superAdmins)
            {
                var locale = superAdmin.User.LocaleOrDefault();
                var subject = translator.TranslateAsync(locale, "organizationInvites", "organizationInvites.subject", null).Result;
                var email = new Email
                {
                    To = superAdmin.User.Email,
                    Subject = subject,
                    ContentTemplate = "OrganizationInviteRequest.txt",
                    ContentModel = new
                    {
                        request.Name,
                        request.OrgAdminEmail,
                        request.WebsiteUrl,
                        BaseUrl = settings.BaseUrl
                    }
                };
                var result = emailRepository.CreateAsync(email).Result;
            }
            var result2 = requestRepository.DeleteAsync(request.Id).Result;
        }
    }
}
