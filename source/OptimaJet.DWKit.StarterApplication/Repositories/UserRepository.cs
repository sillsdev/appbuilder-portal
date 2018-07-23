using System;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class UserRepository : DefaultEntityRepository<User>
    {
        public UserRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
        }

        public async Task<User> GetByAuth0Id(string auth0Id)
            => await base.Get()
                .Where(e => e.ExternalId == auth0Id)
                .Include(u => u.OrganizationMemberships)
                    .ThenInclude(om => om.Organization)
                .FirstOrDefaultAsync();
    }
}
