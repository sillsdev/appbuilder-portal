using System;
using System.Threading.Tasks;
using Hangfire;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class ProjectImportRepository : BaseRepository<ProjectImport>
    {
        private readonly IBackgroundJobClient backgroundJobClient;

        public ProjectImportRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IDbContextResolver contextResolver,
            CurrentUserRepository currentUserRepository,
            EntityHooksService<ProjectImport> statusUpdateService,
            IBackgroundJobClient backgroundJobClient
            ) : base(loggerFactory, jsonApiContext, currentUserRepository, statusUpdateService, contextResolver)
        {
            this.backgroundJobClient = backgroundJobClient;
        }

        public override async Task<ProjectImport> CreateAsync(ProjectImport entity)
        {
            var result = await base.CreateAsync(entity);
            var data = new ProjectImportServiceData { Id = result.Id };
            backgroundJobClient.Enqueue<IProjectImportService>(service => service.Process(data));
            return result;
        }
    }
}
