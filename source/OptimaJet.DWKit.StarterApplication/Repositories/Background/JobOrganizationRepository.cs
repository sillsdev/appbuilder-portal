using System;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class JobOrganizationRepository : JobRepository<Organization>
    {
        public JobOrganizationRepository(
            IDbContextResolver contextResolver
        ) : base(contextResolver)
        {
        }
    }
}