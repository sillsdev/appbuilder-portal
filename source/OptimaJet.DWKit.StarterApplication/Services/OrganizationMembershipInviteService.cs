using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Common;
using I18Next.Net.Plugins;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class InviteUserNotFoundException : Exception { }
    public class InviteExpiredException: Exception { }
    public class InviteRedeemedException: Exception { }
    public class InviteNotFoundExcpetion: Exception { }

    public class OrganizationMembershipInviteService : EntityResourceService<OrganizationMembershipInvite>
    {
        private readonly CurrentUserRepository currentUserRepository;
        private readonly IBackgroundJobClient backgroundJobClient;
        private readonly IEntityRepository<OrganizationMembershipInvite> organizationMembershipInviteRepository;
        private readonly IEntityRepository<OrganizationMembership> organizationMembershipRepository;
        private readonly IJobRepository<Email> emailRepository;
        private readonly ITranslator translator;
        private readonly IRecurringJobManager recurringJobManager;
        protected readonly OrganizationInviteRequestSettings settings;

        public OrganizationMembershipInviteService(
            CurrentUserRepository currentUserRepository,
            IJsonApiContext jsonApiContext,
            IEntityRepository<OrganizationMembershipInvite> organizationMembershipInviteRepository,
            IEntityRepository<OrganizationMembership> organizationMembershipRepository,
            ILoggerFactory loggerFactory,
            IBackgroundJobClient backgroundJobClient,
            IRecurringJobManager recurringJobManager,
            IJobRepository<Email> emailRepository,
            ITranslator translator,
            IOptions<OrganizationInviteRequestSettings> options
        ) : base(jsonApiContext, organizationMembershipInviteRepository, loggerFactory)
        {
            this.currentUserRepository = currentUserRepository;
            this.backgroundJobClient = backgroundJobClient;
            this.recurringJobManager = recurringJobManager;
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

        public async Task<OrganizationMembershipInvite> RedeemAsync(Guid token)
        {
            var invite = await organizationMembershipInviteRepository.Get()
                                    .Include(omi => omi.Organization)
                                    .Where(omi => omi.Token == token)
                                    .DefaultIfEmpty(null)
                                    .FirstOrDefaultAsync();

            var currentUser = await currentUserRepository.GetCurrentUser();
            if (currentUser == null)
            {
                throw new InviteUserNotFoundException();
            }

            if (invite == null)
            {
                throw new InviteNotFoundExcpetion();
            }

            if (invite.Redeemed)
            {
                throw new InviteRedeemedException();
            }

            if (invite.Expires < DateTime.Today)
            {
                throw new InviteExpiredException();
            }

            invite.Redeemed = true;
            await organizationMembershipInviteRepository.UpdateAsync(invite.Id, invite);

            var monitorJob = Job.FromExpression<OrganizationMembershipInviteService>(service => service.ProcessRedeem(currentUser.Id, invite.OrganizationId));
            recurringJobManager.AddOrUpdate(GetHangfireToken(currentUser.Id, invite.OrganizationId), monitorJob, "* * * * *");
            return invite;
        }

        protected string GetHangfireToken(int userId, int orgId)
        {
            return "ProcessRedeem_" + userId + "_" + orgId;
        }

        protected void ClearRecurringJob(int userId, int orgId)
        {
            var jobToken = GetHangfireToken(userId, orgId);
            recurringJobManager.RemoveIfExists(jobToken);
        }

        public async Task ProcessRedeem(int userId, int organizationId )
        {
            var membership = await organizationMembershipRepository.Get().FirstOrDefaultAsync(om => om.OrganizationId == organizationId && om.UserId == userId);
            if (membership == null)
            {
                Log.Information($"ProcessRedeem: Membership not found for userId={userId}, orgId={organizationId}: Creating!");
                membership = await organizationMembershipRepository.CreateAsync(new OrganizationMembership
                {
                    OrganizationId = organizationId,
                    UserId = userId
                });
            }
            else
            {
                Log.Information($"ProcessRedeem: Membership found for userId={userId}, orgId={organizationId}: Ignoring.");
            }
            ClearRecurringJob(userId, organizationId);
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
                ContentTemplate = "OrganizationMembershipInvite.txt",
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
