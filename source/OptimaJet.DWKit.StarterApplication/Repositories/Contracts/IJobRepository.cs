using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{

    public interface IJobRepository<TEntity>
        : IJobRepository<TEntity, int>
        where TEntity : class, IIdentifiable<int>
    {
    }

    public interface IJobRepository<TEntity, TId>
        where TEntity : class, IIdentifiable<TId>
    {
        Task<TEntity> CreateAsync(TEntity entity);
        IQueryable<TEntity> Get();
        Task<List<TEntity>> GetListAsync();
        Task<TEntity> GetAsync(TId id);
        Task<TEntity> UpdateAsync(TEntity entity);
        Task<bool> DeleteAsync(TId id);

    }
}
