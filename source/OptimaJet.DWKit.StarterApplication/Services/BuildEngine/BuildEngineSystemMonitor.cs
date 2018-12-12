using System;
using System.Collections.Generic;
using System.Linq;
using JsonApiDotNetCore.Data;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using SIL.AppBuilder.BuildEngineApiClient;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineSystemMonitor
    {
        public IJobRepository<Organization> OrganizationRepository;
        public IJobRepository<SystemStatus> SystemStatusRepository;

        public IJobRepository<UserRole> UserRolesRepository { get; }
        public SendNotificationService SendNotificationService { get; }
        public IBuildEngineApi BuildEngineApi { get; }

        public BuildEngineSystemMonitor(
            IJobRepository<Organization> organizationRepository,
            IJobRepository<SystemStatus> systemStatusRepository,
            IJobRepository<UserRole> userRolesRepository,
            SendNotificationService sendNotificationService,
            IBuildEngineApi buildEngineApi
        )
        {
            OrganizationRepository = organizationRepository;
            SystemStatusRepository = systemStatusRepository;
            UserRolesRepository = userRolesRepository;
            SendNotificationService = sendNotificationService;
            BuildEngineApi = buildEngineApi;
        }
        public void CheckBuildEngineStatus()
        {
            // Hangfire methods cannot be async, hence the Waits
            SyncDatabaseTablesAsync().Wait();
            CheckSystemStatusesAsync().Wait();
        }
        private async Task SyncDatabaseTablesAsync()
        {
            var organizations = await OrganizationRepository.GetListAsync();
            var statuses = await SystemStatusRepository.GetListAsync();
            var removeList = statuses.Except(organizations, new BuildEngineReferenceComparer()).ToList();
            var addList = organizations.Except(statuses, new BuildEngineReferenceComparer()).ToList();
            foreach (SystemStatus removeEntry in removeList)
            {
                await SystemStatusRepository.DeleteAsync(removeEntry.Id);
            }
            foreach (Organization addEntry in addList)
            {
                var newEntry = new SystemStatus
                {
                    BuildEngineApiAccessToken = addEntry.BuildEngineApiAccessToken,
                    BuildEngineUrl = addEntry.BuildEngineUrl
                };
                await SystemStatusRepository.CreateAsync(newEntry);
            }
        }
        private async Task CheckSystemStatusesAsync()
        {
            var systems = await SystemStatusRepository.GetListAsync();
            foreach (SystemStatus systemEntry in systems)
            {
                var available = CheckConnection(systemEntry);
                if (available != systemEntry.SystemAvailable)
                {
                    systemEntry.SystemAvailable = available;
                    await SystemStatusRepository.UpdateAsync(systemEntry);
                    await sendStatusUpdateNotificationAsync(systemEntry);
                 }
            }
        }

        public void SetSampleDataApiToken(string sampleDataApiToken)
        {
            var tokens = ParseApiTokens(sampleDataApiToken);
            var organizations = OrganizationRepository.Get().ToList();
            foreach (var organization in organizations)
            {
                var token = sampleDataApiToken;
                if (tokens.ContainsKey(organization.Id.ToString()))
                {
                    token = tokens[organization.Id.ToString()];
                }
                
                if (organization.BuildEngineApiAccessToken != token)
                {
                    organization.BuildEngineApiAccessToken = token;
                    OrganizationRepository.UpdateAsync(organization).Wait();
                }
            }
        }

        private static Dictionary<string,string> ParseApiTokens(string sampleDataApiToken)
        {
            var tokens = new Dictionary<string, string>();
            if (sampleDataApiToken.Contains('|'))
            {
                var entries = sampleDataApiToken.Split('|');
                foreach (var entry in entries)
                {
                    var values = entry.Split('=');
                    if (values.Count() == 2)
                    {
                        tokens[values[0]] = values[1];
                    }
                }
            }
            return tokens;
        }

        private bool CheckConnection(SystemStatus systemEntry)
        {
            try
            {
                if (systemEntry.BuildEngineUrl is null || systemEntry.BuildEngineApiAccessToken is null)
                {
                    return false;
                }
                BuildEngineApi.SetEndpoint(systemEntry.BuildEngineUrl, systemEntry.BuildEngineApiAccessToken);
                var response = BuildEngineApi.SystemCheck();
                if (response == System.Net.HttpStatusCode.OK)
                {
                    return true;
                }
                return false;
            }
            catch
            {
                // Exception can be thrown in cases where the url is bad
                return false;
            }
        }
        protected async Task sendStatusUpdateNotificationAsync(SystemStatus systemEntry)
        {
            var organizations = OrganizationRepository.Get()
                                                      .Where(o => (o.BuildEngineUrl == systemEntry.BuildEngineUrl)
                                                             && (o.BuildEngineApiAccessToken == systemEntry.BuildEngineApiAccessToken));
             foreach (Organization organization in organizations)
            {
                var messageParms = new {
                    orgName = organization.Name,
                    url = organization.BuildEngineUrl,
                    token = organization.BuildEngineApiAccessToken};
                await SendNotificationService.SendNotificationToOrgAdminsAsync(organization,
                                                                               systemEntry.SystemAvailable ? "notifications.buildengineConnected" : "notifications.buildengineDisconnected",
                                                                               messageParms);
            }
        }
    }
}
