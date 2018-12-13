using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Utility.Extensions.JSONAPI;
using static OptimaJet.DWKit.StarterApplication.Utility.IEnumerableExtensions;
using static OptimaJet.DWKit.StarterApplication.Utility.RepositoryExtensions;
using static OptimaJet.DWKit.StarterApplication.Utility.Extensions.JSONAPI.FilterQueryExtensions;


namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class UserTaskRepository : BaseRepository<UserTask>
    {
        public CurrentUserRepository CurrentUserRepository { get; }

        public UserTaskRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            CurrentUserRepository currentUserRepository,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, currentUserRepository, contextResolver)
        {
            this.CurrentUserRepository = currentUserRepository;
        }

        public override IQueryable<UserTask> Get() 
        {
            var currentUser = this.CurrentUserRepository.GetCurrentUser().Result;
            var id = currentUser.Id;

            return base
                .Get()
                .Where(ut => ut.UserId == id);
        }
    }
}
