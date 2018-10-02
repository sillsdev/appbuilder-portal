using System;
using JsonApiDotNetCore.Data;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class JobProjectRepository : JobRepository<Project>
    {
        public JobProjectRepository(
            IDbContextResolver contextResolver
        ) : base(contextResolver)
        {
        }
    }
}
