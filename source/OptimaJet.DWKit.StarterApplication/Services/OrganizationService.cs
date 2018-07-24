using System;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class OrganizationService : EntityResourceService<Organization>
    {
        public IEntityRepository<Organization> OrganizationRepository { get; }
        public IEntityRepository<OrganizationMembership, Guid> OrganizationMembershipRepository { get; }


        public OrganizationService(
            IJsonApiContext jsonApiContext,
            IEntityRepository<Organization> organizationRepository,
            IEntityRepository<OrganizationMembership, Guid> organizationMembershipRepository,
            ILoggerFactory loggerFactory) : base(jsonApiContext, organizationRepository, loggerFactory)
        {
            this.OrganizationRepository = organizationRepository;
            this.OrganizationMembershipRepository = organizationMembershipRepository;
        }

        public override async Task<Organization> CreateAsync(Organization entity)
        {
            var newEntity = await base.CreateAsync(entity);

            // an org can only be created by the owner of the org. (for now anyway)            
            var membership = new OrganizationMembership {
                User = newEntity.Owner,
                Organization = newEntity
            };

            await OrganizationMembershipRepository.CreateAsync(membership);

            return newEntity;
        }

        public async Task<Organization> FindByNameOrDefaultAsync(string name)
        {
            return await OrganizationRepository.Get()
                                               .Where(e => e.Name == name)
                                               .FirstOrDefaultAsync();
        }
    }
}
