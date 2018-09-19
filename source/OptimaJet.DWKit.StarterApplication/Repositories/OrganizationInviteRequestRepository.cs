﻿using System;
using System.Threading.Tasks;
using Hangfire;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class OrganizationInviteRequestRepository : ControllerRepository<OrganizationInviteRequest>
    {
        private readonly IBackgroundJobClient backgroundJobClient;

        public OrganizationInviteRequestRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IDbContextResolver contextResolver,
            IBackgroundJobClient backgroundJobClient
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.backgroundJobClient = backgroundJobClient;
        }

        public override async Task<OrganizationInviteRequest> CreateAsync(OrganizationInviteRequest entity)
        {
            var result = await base.CreateAsync(entity);
            var data = new OrganizationInviteRequestServiceData { Id = result.Id };
            backgroundJobClient.Enqueue<IOrganizationInviteRequestService>(service => service.Process(data));
            return result;
        }
    }
}
