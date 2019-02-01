using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class BaseRepository<TEntity> : BaseRepository<TEntity, int>, IEntityRepository<TEntity>
        where TEntity : class, IIdentifiable<int>
    {
        public BaseRepository(ILoggerFactory loggerFactory,
                              IJsonApiContext jsonApiContext,
                              CurrentUserRepository currentUserRepository,
                              StatusUpdateService statusUpdateService,
                              IDbContextResolver contextResolver)
            : base(loggerFactory, jsonApiContext, currentUserRepository, statusUpdateService, contextResolver)
        {
        }
    }

    public class BaseRepository<TEntity, TId> : DefaultEntityRepository<TEntity, TId>
        where TEntity : class, IIdentifiable<TId>
    {
        protected readonly DbSet<TEntity> dbSet;
        protected readonly CurrentUserRepository currentUserRepository;
        protected readonly StatusUpdateService statusUpdateService;
        protected readonly DbContext dbContext;

        public BaseRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            CurrentUserRepository currentUserRepository,
            StatusUpdateService statusUpdateService,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.dbContext = contextResolver.GetContext();
            this.dbSet = contextResolver.GetDbSet<TEntity>();
            this.currentUserRepository = currentUserRepository;
            this.statusUpdateService = statusUpdateService;
        }

        public User CurrentUser {
            get {
                return currentUserRepository.GetCurrentUser().Result;
            }
        }

        public override async Task<TEntity> UpdateAsync(TId id, TEntity entity)
        {
            var retval = await base.UpdateAsync(id, entity);
            statusUpdateService.OnUpdate(retval as IStatusUpdate);
            return retval;
        }

        public override async Task<TEntity> CreateAsync(TEntity entity)
        {
            var retval = await base.CreateAsync(entity);
            statusUpdateService.OnInsert(retval as IStatusUpdate);
            return retval;
        }

        public override async Task<bool> DeleteAsync(TId id)
        {
            var entity = await GetAsync(id);
            var retval = await base.DeleteAsync(id);
            if (retval)
            {
                statusUpdateService.OnDelete(entity as IStatusUpdate);
            }
            return retval;
        }
    }
}
