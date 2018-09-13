using System;
using System.Threading.Tasks;
using Hangfire;
using JsonApiDotNetCore.Data;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class JobEmailRepository : JobRepository<Email>
    {
        private readonly IBackgroundJobClient backgroundJobClient;

        public JobEmailRepository(IDbContextResolver contextResolver,
                                  IBackgroundJobClient backgroundJobClient) : base(contextResolver)
        {
            this.backgroundJobClient = backgroundJobClient;
        }

        public override async Task<Email> CreateAsync(Email entity)
        {
            var result = await base.CreateAsync(entity);
            var data = new EmailServiceData { Id = result.Id };
            backgroundJobClient.Enqueue<IEmailService>(service => service.Process(data));

            return result;
        }
    }
}
