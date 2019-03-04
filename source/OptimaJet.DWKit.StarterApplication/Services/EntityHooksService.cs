using Hangfire;
using System.Collections.Generic;
using OptimaJet.DWKit.StarterApplication.Models;
using Microsoft.Extensions.DependencyInjection;
using System;
using OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler;
using System.Linq.Expressions;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class EntityHooksService<TEntity>: EntityHooksService<TEntity, int>
        where TEntity : class, IIdentifiable<int> {
        public EntityHooksService(
            IBackgroundJobClient backgroundJobClient,
            IServiceProvider serviceProvider
        ) : base(backgroundJobClient, serviceProvider) {}
    }

    public class EntityHooksService<TEntity, TKey> where TEntity : class, IIdentifiable<TKey>
    {
        public IBackgroundJobClient BackgroundJobClient { get; }
        public IServiceProvider ServiceProvider { get; }

        public EntityHooksService(
            IBackgroundJobClient backgroundJobClient,
            IServiceProvider serviceProvider
        )
        {
            BackgroundJobClient = backgroundJobClient;
            ServiceProvider = serviceProvider;
        }

        public void DidInsert(IIdentifiable entity)
        {
            NotifyOperation(entity, s => s.DidInsert(entity.StringId));
        }

        public void DidUpdate(IIdentifiable entity)
        {
            NotifyOperation(entity, s => s.DidUpdate(entity.StringId));
        }

        public void DidDelete(IIdentifiable entity)
        {
            NotifyOperation(entity, s => s.DidDelete(entity.StringId));
        }


        protected void NotifyOperation(IIdentifiable entity, Expression<Action<IEntityHookHandler<TEntity, TKey>>> action)
        {
            if (entity == null) return;

            var id = entity.StringId;
            if (string.IsNullOrEmpty(id)) return;

            var services = ServiceProvider.GetServices<IEntityHookHandler<TEntity, TKey>>();
            foreach (var service in services)
            {
                BackgroundJobClient.Enqueue<IEntityHookHandler<TEntity, TKey>>(action);
            }
        }
    }
}
