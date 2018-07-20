using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
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

    }
}
