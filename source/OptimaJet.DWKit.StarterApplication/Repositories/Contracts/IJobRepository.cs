using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    // TODO: Refactor template so that it works with TId not int
    public interface IJobRepository<TEntity>
        where TEntity : class, IIdentifiable<int>
    {
        Task<TEntity> CreateAsync(TEntity entity);
        IQueryable<TEntity> Get();
        Task<List<TEntity>> GetListAsync();
        Task<TEntity> GetAsync(int id);
        Task<TEntity> UpdateAsync(TEntity entity);
        Task<bool> DeleteAsync(int id);
    }
}
