using System;
using System.Threading.Tasks;
using Hangfire;
using JsonApiDotNetCore.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class JobEmailRepository : JobRepository<Email>
    {
        public IBackgroundJobClient BackgroundJobClient { get; }

        public JobEmailRepository(IDbContextResolver contextResolver,
                                  EntityHooksService<Email, int> statusUpdateService,
                                  IBackgroundJobClient backgroundJobClient) : base(contextResolver, statusUpdateService)
        {
            BackgroundJobClient = backgroundJobClient;
        }

        public override async Task<Email> CreateAsync(Email entity)
        {
            var result = await base.CreateAsync(entity);
            var data = new EmailServiceData { Id = result.Id };
            BackgroundJobClient.Enqueue<IEmailService>(service => service.Process(data));

            return result;
        }
    }
}
