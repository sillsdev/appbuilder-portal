using System;
using System.Threading.Tasks;
using Hangfire;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
	public class OrganizationInviteRequestRepository : DefaultEntityRepository<OrganizationInviteRequest>
    {
        public OrganizationInviteRequestRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            Log.Information("Constructed OrganizationInviteRequestRepository");
        }

        public override async Task<OrganizationInviteRequest> CreateAsync(OrganizationInviteRequest entity)
        {
            Log.Information("OrganizationInviteRequestRepository::CreateAsync");
            var result = await base.CreateAsync(entity);
            var data = new OrganizationInviteRequestServiceData { Id = result.Id };
            BackgroundJob.Enqueue<IOrganizationInviteRequestService>(service => service.Process(data));

            return result;
        }
    }
}
