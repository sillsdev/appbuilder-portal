using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using static OptimaJet.DWKit.StarterApplication.Utility.ServiceExtensions;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class UserService : EntityResourceService<User>
    {
        public UserRepository EntityRepository { get; }
        public IJsonApiContext JsonApiContext { get; }
        public IOrganizationContext OrganizationContext { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public CurrentUserRepository CurrentUserRepository { get; }

        public UserService(
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext,
            CurrentUserRepository currentUserRepository,
            IEntityRepository<User> entityRepository,
            ILoggerFactory loggerFactory) : base(jsonApiContext, entityRepository, loggerFactory)
        {
            this.EntityRepository = (UserRepository)entityRepository;
            JsonApiContext = jsonApiContext;
            OrganizationContext = organizationContext;
            CurrentUserContext = currentUserContext;
            CurrentUserRepository = currentUserRepository;
        }

        public override async Task<IEnumerable<User>> GetAsync()
        {
            return await GetScopedToOrganization<User>(base.GetAsync,
                                   OrganizationContext,
                                   JsonApiContext);

        }
        // public override async Task<User> GetAsync(int id)
        // {
        //     var currentUser = EntityRepository.GetByAuth0Id(CurrentUserContext.Auth0Id).Result;
        //     if (currentUser.Id == id)
        //     {
        //         return await base.GetAsync(id);
        //     }
        //     var users = await GetAsync();
        //     return users.SingleOrDefault(u => u.Id == id);
        // }
        public override async Task<User> UpdateAsync(int id, User resource)
        {
            var user = await GetAsync(id);
            if (user == null)
            {
                throw new JsonApiException(404, $"User Id '{id}' not found."); ;
            }
            return await base.UpdateAsync(id, resource);
        }

        public async Task<User> GetCurrentUser() {
            var currentUser = await CurrentUserRepository.GetCurrentUser();

            if (null == currentUser) return null;

            return await base.GetAsync(currentUser.Id);
        }
    }
}