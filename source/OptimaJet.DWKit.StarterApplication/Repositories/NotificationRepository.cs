using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class NotificationRepository : BaseRepository<Notification>
    {
        public NotificationRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            CurrentUserRepository currentUserRepository,
            StatusUpdateService statusUpdateService,
            IDbContextResolver contextResolver
        ) : base(loggerFactory, jsonApiContext, currentUserRepository, statusUpdateService, contextResolver)
        {
        }

        public override IQueryable<Notification> Get()
        {
            return base.Get().Where(n => n.User == CurrentUser);
        }
    }
}
