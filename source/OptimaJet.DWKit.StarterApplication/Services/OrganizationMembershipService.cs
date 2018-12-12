using System;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Forms.GroupMemberships;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class OrganizationMembershipService : EntityResourceService<OrganizationMembership>
    {
        public OrganizationMembershipService(
            IJsonApiContext jsonApiContext,
            UserRepository userRepository,
            ICurrentUserContext currentUserContext,
            IEntityRepository<OrganizationMembership> organizationMembershipRepository,
            ILoggerFactory loggerFactory
        ) : base(jsonApiContext, organizationMembershipRepository, loggerFactory)
        {
            UserRepository = userRepository;
            OrganizationMembershipRepository = organizationMembershipRepository;

        }
        private UserRepository UserRepository { get; set; }
        private IEntityRepository<OrganizationMembership> OrganizationMembershipRepository { get; set; }


        public async Task<OrganizationMembership> CreateByEmail(OrganizationMembership membership)
        {
            if (membership.Email == null || membership.OrganizationId == 0) return null;

            User userForEmail = UserRepository.Get().Where(p => p.Email == membership.Email).DefaultIfEmpty(null).FirstOrDefault();

            if (userForEmail == null) return null;

            membership.UserId = userForEmail.Id;
            return await this.OrganizationMembershipRepository.CreateAsync(membership);
        }
    }



}
