﻿using System.Collections.Generic;
using System.Linq;
using Hangfire.Server;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using SIL.AppBuilder.BuildEngineApiClient;
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineServiceBase
    {
        private const int MAX_RETRIES = 10;

        public BuildEngineServiceBase(
            IBuildEngineApi buildEngineApi,
            SendNotificationService sendNotificationService,
            IJobRepository<SystemStatus> systemStatusRepository
        )
        {
            BuildEngineApi = buildEngineApi;
            SendNotificationService = sendNotificationService;
            SystemStatusRepository = systemStatusRepository;
        }

        public IBuildEngineApi BuildEngineApi { get; }
        public SendNotificationService SendNotificationService { get; }
        public IJobRepository<SystemStatus> SystemStatusRepository { get; }

        protected bool BuildEngineLinkAvailable(Organization organization)
        {
            var endpoint = GetBuildEngineEndpoint(organization);
            var systemStatus = SystemStatusRepository.Get()
                 .Where(ss => (ss.BuildEngineApiAccessToken == endpoint.ApiAccessToken)
                        && (ss.BuildEngineUrl == endpoint.Url))
                 .FirstOrDefaultAsync().Result;
                        
            if (systemStatus == null)
            {
                // TODO: Send Notification
                return false;
            }

            return systemStatus.SystemAvailable;
        }
        protected bool SetBuildEngineEndpoint(Organization organization)
        {
            var endpoint = GetBuildEngineEndpoint(organization);
            if (!endpoint.IsValid()) { return  false; }
            BuildEngineApi.SetEndpoint(endpoint.Url, endpoint.ApiAccessToken);
            return true;
        }

        public static BuildEngineEndpoint GetDefaultEndpoint()
        {
            return new BuildEngineEndpoint
            {
                Url = GetVarOrDefault("DEFAULT_BUILDENGINE_URL", null),
                ApiAccessToken = GetVarOrDefault("DEFAULT_BUILDENGINE_API_ACCESS_TOKEN", null)
            };

        }
        public static BuildEngineEndpoint GetBuildEngineEndpoint(Organization organization)
        {
            var endpoint = new BuildEngineEndpoint
            {
                Url = organization.BuildEngineUrl,
                ApiAccessToken = organization.BuildEngineApiAccessToken
            };
            if (organization.UseDefaultBuildEngine.GetValueOrDefault())
            {
                var defaultEndpoint = GetDefaultEndpoint();
                if (defaultEndpoint.IsValid()) return defaultEndpoint;
            }
            return endpoint;
        }
        protected bool IsFinalRetry(PerformContext context)
        {
            if (context is null)
            {
                // Context should only be null in testing
                // This allows testing of notification messages
                return true;
            }
            var retryCount = context.GetJobParameter<int>("RetryCount");
            if (retryCount < MAX_RETRIES)
            {
                return false;
            }
            return true;
        }
        protected async System.Threading.Tasks.Task SendNotificationOnFinalRetryAsync(PerformContext context,
                                                    Organization organization,
                                                    User user,
                                                    string messageId,
                                                    Dictionary<string, object> subs)
        {
            if (IsFinalRetry(context))
            {
                await SendNotificationService.SendNotificationToOrgAdminsAndOwnerAsync(organization, user,
                                                               messageId, subs);

            }
        }
    }
}
