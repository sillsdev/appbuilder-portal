using System.Linq;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class GroupRepository : DefaultEntityRepository<Group>
    {
        public IOrganizationContext OrganizationContext { get; }
        public GroupRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.OrganizationContext = organizationContext;
        }

        public override IQueryable<Group> Get()
        {
            if (OrganizationContext.SpecifiedOrganizationDoesNotExist) return Enumerable.Empty<Group>().AsQueryable();

            // Get groups owned by the current organization
            return base.Get()
                       .Where(g => g.OwnerId == OrganizationContext.OrganizationId);
        }
    }
}