using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using static OptimaJet.DWKit.StarterApplication.Utility.ServiceExtensions;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class OrganizationStoreService : EntityResourceService<OrganizationStore>
    {
        public IOrganizationContext OrganizationContext { get; }
        public IEntityRepository<OrganizationStore> organizationStoreRepository { get; }
        public CurrentUserRepository CurrentUserRepository { get; }
        public IJsonApiContext JsonApiContext { get; }

        public OrganizationStoreService(
            IJsonApiContext jsonApiContext,
            IEntityRepository<OrganizationStore> organizationStoreRepository,
            CurrentUserRepository currentUserRepository,
            IOrganizationContext organizationContext,
            ILoggerFactory loggerFactory) 
            : base(jsonApiContext, organizationStoreRepository, loggerFactory)
        {
            this.OrganizationContext = organizationContext;
            this.organizationStoreRepository = organizationStoreRepository;
            this.CurrentUserRepository = currentUserRepository;
            this.JsonApiContext = jsonApiContext;
        }

        public override async Task<IEnumerable<OrganizationStore>> GetAsync()
        {
            if (this.OrganizationContext.IsOrganizationHeaderPresent) 
            {
                return await GetScopedToOrganization<OrganizationStore>(
                    base.GetAsync,
                    this.OrganizationContext,
                    JsonApiContext);
            }

            return await base.GetAsync();
        }
    }
}
