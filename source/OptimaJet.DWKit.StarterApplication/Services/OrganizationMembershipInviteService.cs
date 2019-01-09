using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using I18Next.Net.Plugins;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class InviteExpiredException: Exception { }
    public class InviteRedeemedException: Exception { }

    public class OrganizationMembershipInviteService : EntityResourceService<OrganizationMembershipInvite>
    {
        private readonly CurrentUserRepository currentUserRepository;
        private readonly IBackgroundJobClient backgroundJobClient;
        private readonly IEntityRepository<OrganizationMembershipInvite> organizationMembershipInviteRepository;
        private readonly IEntityRepository<OrganizationMembership> organizationMembershipRepository;
        private readonly IJobRepository<Email> emailRepository;
        private readonly ITranslator translator;
        protected readonly OrganizationInviteRequestSettings settings;

        public OrganizationMembershipInviteService(
            CurrentUserRepository currentUserRepository,
            IJsonApiContext jsonApiContext,
            IEntityRepository<OrganizationMembershipInvite> organizationMembershipInviteRepository,
            IEntityRepository<OrganizationMembership> organizationMembershipRepository,
            ILoggerFactory loggerFactory,
            IBackgroundJobClient backgroundJobClient,
            IJobRepository<Email> emailRepository,
            ITranslator translator,
            IOptions<OrganizationInviteRequestSettings> options
        ) : base(jsonApiContext, organizationMembershipInviteRepository, loggerFactory)
        {
            this.currentUserRepository = currentUserRepository;
            this.backgroundJobClient = backgroundJobClient;
            this.organizationMembershipInviteRepository = organizationMembershipInviteRepository;
            this.organizationMembershipRepository = organizationMembershipRepository;
            this.emailRepository = emailRepository;
            this.settings = options.Value;
            this.translator = translator;
        }

        public override async Task<OrganizationMembershipInvite> CreateAsync(OrganizationMembershipInvite resource)
        {
            var result = await base.CreateAsync(resource);
            backgroundJobClient.Enqueue<OrganizationMembershipInviteService>(s => s.sendInviteEmail(result.Id));
            return result;
        }

        public async Task<OrganizationMembership> RedeemAsync(Guid token)
        {
            var invite = await organizationMembershipInviteRepository.Get()
                                    .Include(omi => omi.Organization)
                                    .Where(omi => omi.Token == token)
                                    .FirstAsync();

            if (invite.Redeemed)
            {
                throw new InviteRedeemedException();
            }

            if (invite.Expires < DateTime.Today)
            {
                throw new InviteExpiredException();
            }

            var currentUser = await currentUserRepository.GetCurrentUser();


            var membership = currentUser.OrganizationMemberships.Find(om => om.OrganizationId == invite.OrganizationId);

            if (membership == null)
            {
                membership = await organizationMembershipRepository.CreateAsync(new OrganizationMembership
                {
                    Organization = invite.Organization,
                    User = currentUser
                });
            }

            invite.Redeemed = true;
            await organizationMembershipInviteRepository.UpdateAsync(invite.Id, invite);

            return membership;
        }

        public async Task sendInviteEmail(int inviteId)
        {
            var loadedInvite = await organizationMembershipInviteRepository.Get()
                .Include(i => i.InvitedBy)
                .Include(i => i.Organization)
                .Where(i => i.Id == inviteId)
                .FirstAsync();

            var locale = loadedInvite.InvitedBy.LocaleOrDefault();

            string subject = await translator.TranslateAsync(locale, "organizationMembershipInvites", "organizationMembershipInvites.subject", 
                new Dictionary<string, object>{ 
                    ["organizationName"] = loadedInvite.Organization.Name
                });
                
            var email = new Email
            {
                To = loadedInvite.Email,
                Subject = subject,
                ContentTemplate = "OrganizationMembershipInvite.cshtml",
                ContentModel = new
                {
                    OrganizationName = loadedInvite.Organization.Name,
                    InvitedBy = $"{loadedInvite.InvitedBy.GivenName} {loadedInvite.InvitedBy.FamilyName}",
                    loadedInvite.Token,
                    settings.BaseUrl
                }
            };
            await emailRepository.CreateAsync(email);
        }
    }
}
