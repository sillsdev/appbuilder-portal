using System;
using System.Threading.Tasks;
using Hangfire;
using JsonApiDotNetCore.Data;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class BackgroundEmailRepository : BackgroundRepository<Email>
    {
        public BackgroundEmailRepository(IDbContextResolver contextResolver) : base(contextResolver)
        {
        }

        public override async Task<Email> CreateAsync(Email entity)
        {
            var result = await base.CreateAsync(entity);
            var data = new EmailServiceData { Id = result.Id };
            BackgroundJob.Enqueue<IEmailService>(service => service.Process(data));

            return result;
        }
    }
}
