using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Models;
using Microsoft.EntityFrameworkCore;


namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class BackgroundRepository<TEntity> 
        : IBackgroundRepository<TEntity>
        where TEntity : class, IIdentifiable<int>
    {
        protected readonly DbSet<TEntity> dbSet;
        protected readonly DbContext dbContext;

        public BackgroundRepository(IDbContextResolver contextResolver)
        {
            this.dbContext = contextResolver.GetContext();
            this.dbSet = contextResolver.GetDbSet<TEntity>();
        }

        public virtual async Task<TEntity> CreateAsync(TEntity entity)
        {
            dbSet.Add(entity);

            var retval = await dbContext.SaveChangesAsync();
            return entity;
        }

        public virtual IQueryable<TEntity> Get()
        {
            return dbSet;
        }

        public virtual async Task<TEntity> GetAsync(int id)
        {
            return await Get().SingleOrDefaultAsync(e => e.Id.Equals(id));
        }

        public virtual async Task<TEntity> UpdateAsync(TEntity entity)
        {
            if (entity == null) return null;

            dbSet.Update(entity);
            await dbContext.SaveChangesAsync();
            return entity;
        }
        public virtual async Task<bool> DeleteAsync(int id)
        {
            var entity = await GetAsync(id);
            if (entity == null) return false;

            dbSet.Remove(entity);
            await dbContext.SaveChangesAsync();
            return true;
        }
    }
}
