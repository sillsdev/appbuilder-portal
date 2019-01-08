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
    public class UserTaskService : EntityResourceService<UserTask>
    {
        public IOrganizationContext OrganizationContext { get; }
        public IEntityRepository<UserTask> UserTaskRepository { get; }
        public CurrentUserRepository CurrentUserRepository { get; }
        public IJsonApiContext JsonApiContext { get; }

        public UserTaskService(
            IJsonApiContext jsonApiContext,
            IEntityRepository<UserTask> userTaskRepository,
            CurrentUserRepository currentUserRepository,
            IOrganizationContext organizationContext,
            ILoggerFactory loggerFactory) 
            : base(jsonApiContext, userTaskRepository, loggerFactory)
        {
            this.OrganizationContext = organizationContext;
            this.UserTaskRepository = userTaskRepository;
            this.CurrentUserRepository = currentUserRepository;
            this.JsonApiContext = jsonApiContext;
        }

        public override async Task<IEnumerable<UserTask>> GetAsync()
        {
            if (this.OrganizationContext.IsOrganizationHeaderPresent) 
            {
                return await GetScopedToOrganization<UserTask>(
                    base.GetAsync,
                    this.OrganizationContext,
                    JsonApiContext);
            }

            return await base.GetAsync();
        }
    }
}
