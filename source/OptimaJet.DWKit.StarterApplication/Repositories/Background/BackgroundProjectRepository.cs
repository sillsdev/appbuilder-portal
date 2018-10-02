using System;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class BackgroundProjectRepository : BackgroundRepository<Project>
    {
        public BackgroundProjectRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IDbContextResolver contextResolver
        ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
        }
    }
}
