using System;
using System.Threading.Tasks;
using Hangfire;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Services.Contracts;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class ProductUserChangeRepository : BaseRepository<ProductUserChange>
    {
        public IBackgroundJobClient BackgroundJobClient { get; }
        public ProductUserChangeRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IDbContextResolver contextResolver,
            CurrentUserRepository currentUserRepository,
            EntityHooksService<ProductUserChange> statusUpdateService,
            IBackgroundJobClient backgroundJobClient
            ) : base(loggerFactory, jsonApiContext, currentUserRepository, statusUpdateService, contextResolver)
        {
            BackgroundJobClient = backgroundJobClient;
        }

        public override async Task<ProductUserChange> CreateAsync(ProductUserChange entity)
        {
            var result = await base.CreateAsync(entity);
            var data = new ProcessProductUserChangeData { Id = result.Id };
            BackgroundJobClient.Enqueue<IProcessProductUserChangeService>(service => service.Process(data));
            return result;
        }
    }
}

