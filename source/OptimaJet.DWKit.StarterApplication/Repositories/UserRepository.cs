using System;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class UserRepository : DefaultEntityRepository<User>
    {
        public IOrganizationContext OrganizationContext { get; }

        public UserRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.OrganizationContext = organizationContext;
        }

        public override IQueryable<User> Get()
        {
            if (OrganizationContext.InvalidOrganization) return base.Get().Take(0);
            var users = base.Get().Include(u => u.OrganizationMemberships);
            if (!OrganizationContext.HasOrganization) return users;

            var filteredUsers = users.Where(u => u.OrganizationMemberships.Any(o => o.OrganizationId == OrganizationContext.OrganizationId));
            return filteredUsers;
        }

        public async Task<User> GetByAuth0Id(string auth0Id)
            => await base.Get()
                .Where(e => e.ExternalId == auth0Id)
                .Include(u => u.OrganizationMemberships)
                    .ThenInclude(om => om.Organization)
                .FirstOrDefaultAsync();
    }
}
