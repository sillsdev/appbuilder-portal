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
    public class CurrentUserRepository : DefaultEntityRepository<User> 
    {
        // NOTE: this repository MUST not rely on any other repositories or services
        public CurrentUserRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IDbContextResolver contextResolver,
            ICurrentUserContext currentUserContext
        ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.CurrentUserContext = currentUserContext;
        }

        public ICurrentUserContext CurrentUserContext { get; }

        public async Task<User> GetCurrentUser()
        {
            var auth0Id = this.CurrentUserContext.Auth0Id;

            var currentUser = await base.Get()
                .Where(user => user.ExternalId.Equals(auth0Id))
                .FirstOrDefaultAsync();

            return currentUser;
        }
    }
}