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

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class UserTaskService : EntityResourceService<UserTask>
    {
        public IEntityRepository<UserTask> UserTaskRepository { get; }
        public CurrentUserRepository CurrentUserRepository { get; }

    public UserTaskService(
            IJsonApiContext jsonApiContext,
            IEntityRepository<UserTask> userTaskRepository,
            CurrentUserRepository currentUserRepository,
            ILoggerFactory loggerFactory) 
            : base(jsonApiContext, userTaskRepository, loggerFactory)
        {
            this.UserTaskRepository = userTaskRepository;
            this.CurrentUserRepository = currentUserRepository;
        }
    }
}
