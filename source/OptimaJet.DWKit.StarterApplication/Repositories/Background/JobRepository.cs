using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Models;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class JobRepository<TEntity>
        : JobRepository<TEntity, int>,
        IJobRepository<TEntity>
        where TEntity : class, IIdentifiable<int>
    {
        public JobRepository(
            IDbContextResolver contextResolver,
            EntityHooksService<TEntity> statusUpdateService)
            : base(contextResolver, statusUpdateService)
        {}
    }

    public class JobRepository<TEntity, TId> 
        : IJobRepository<TEntity, TId>
        where TEntity : class, IIdentifiable<TId>
    {
        protected readonly DbSet<TEntity> dbSet;
        protected readonly DbContext dbContext;

        public EntityHooksService<TEntity> StatusUpdateService { get; }

        public JobRepository(
            IDbContextResolver contextResolver,
            EntityHooksService<TEntity> statusUpdateService
        )
        {
            this.dbContext = contextResolver.GetContext();
            this.dbSet = contextResolver.GetDbSet<TEntity>();
            StatusUpdateService = statusUpdateService;
        }

        public virtual async Task<TEntity> CreateAsync(TEntity entity)
        {
            dbSet.Add(entity);

            var retval = await dbContext.SaveChangesAsync();
            StatusUpdateService.DidInsert(entity);
            return entity;
        }

        public virtual IQueryable<TEntity> Get()
        {
            return dbSet;
        }

        public virtual Task<List<TEntity>> GetListAsync()
        {
            return dbSet.ToListAsync();
        }
        public virtual async Task<TEntity> GetAsync(TId id)
        {
            return await Get().SingleOrDefaultAsync(e => e.Id.Equals(id));
        }

        public virtual async Task<TEntity> UpdateAsync(TEntity entity)
        {
            if (entity == null) return null;

            dbSet.Update(entity);
            await dbContext.SaveChangesAsync();
            StatusUpdateService.DidUpdate(entity);
            return entity;
        }
        public virtual async Task<bool> DeleteAsync(TId id)
        {
            var entity = await GetAsync(id);
            if (entity == null) return false;

            dbSet.Remove(entity);
            await dbContext.SaveChangesAsync();
            StatusUpdateService.DidDelete(entity);
            return true;
        }
    }
}
