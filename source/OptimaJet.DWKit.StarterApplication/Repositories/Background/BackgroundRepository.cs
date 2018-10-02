using System;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class BackgroundRepository<TEntity> : DefaultEntityRepository<TEntity>
        where TEntity : class, IIdentifiable<int>
    {
        protected readonly DbSet<TEntity> dbSet;
        protected readonly DbContext dbContext;

        public BackgroundRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IDbContextResolver contextResolver) : base (loggerFactory, jsonApiContext, contextResolver)
        {
            this.dbContext = contextResolver.GetContext();
            this.dbSet = contextResolver.GetDbSet<TEntity>();
        }

    }
}
