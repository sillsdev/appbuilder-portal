using System;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class JobSystemStatusRepository : JobRepository<SystemStatus>
    {
        public JobSystemStatusRepository(
            IDbContextResolver contextResolver
        ) : base(contextResolver)
        {
        }
    }
}