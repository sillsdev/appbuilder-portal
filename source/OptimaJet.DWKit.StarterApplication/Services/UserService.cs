using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services.Workflow;
using static OptimaJet.DWKit.StarterApplication.Utility.ServiceExtensions;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class UserService : EntityResourceService<User>
    {
        public UserRepository EntityRepository { get; }
        public IBackgroundJobClient HangfireClient { get; }
        public IJsonApiContext JsonApiContext { get; }
        public IOrganizationContext OrganizationContext { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public UserRepository UserRepository { get; }
        public CurrentUserRepository CurrentUserRepository { get; }
        public IEntityRepository<UserRole> UserRolesRepository { get; }

        public UserService(
            IBackgroundJobClient hangfireClient,
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext,
            UserRepository userRepository,
            CurrentUserRepository currentUserRepository,
            IEntityRepository<User> entityRepository,
            IEntityRepository<UserRole> userRolesRepository,
            ILoggerFactory loggerFactory) : base(jsonApiContext, entityRepository, loggerFactory)
        {
            this.EntityRepository = (UserRepository)entityRepository;
            HangfireClient = hangfireClient;
            JsonApiContext = jsonApiContext;
            OrganizationContext = organizationContext;
            CurrentUserContext = currentUserContext;
            UserRepository = userRepository;
            CurrentUserRepository = currentUserRepository;
            UserRolesRepository = userRolesRepository;
        }

        public override async Task<User> CreateAsync(User resource)
        {
            User user = await base.CreateAsync(resource);
            if (user != null)
            {
                HangfireClient.Enqueue<WorkflowSecuritySyncService>(service => service.SyncNewUser(user.Id));
            }
            return user;
        }

        public override async Task<IEnumerable<User>> GetAsync()
        {
            return await GetScopedToOrganization<User>(base.GetAsync,
                                   OrganizationContext,
                                   JsonApiContext);

        }
        public override async Task<User> GetAsync(int id)
        {
            var currentUser = await CurrentUserRepository.GetCurrentUser();
            if (currentUser.Id == id)
            {
                return await base.GetAsync(id);
            }

            var users = await GetAsync();

            return users.SingleOrDefault(u => u.Id == id);
        }

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