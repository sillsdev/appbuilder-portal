using System;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class BaseRepository<TEntity> : DefaultEntityRepository<TEntity>
        where TEntity : class, IIdentifiable<int>
    {
        protected readonly DbSet<TEntity> dbSet;
        protected readonly CurrentUserRepository currentUserRepository;
        protected readonly DbContext dbContext;

        public BaseRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            CurrentUserRepository currentUserRepository,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.dbContext = contextResolver.GetContext();
            this.dbSet = contextResolver.GetDbSet<TEntity>();
            this.currentUserRepository = currentUserRepository;
        }

        public User CurrentUser {
            get {
                return currentUserRepository.GetCurrentUser().Result;
            }
        }
    }
}
