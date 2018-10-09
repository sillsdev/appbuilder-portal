using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using SIL.AppBuilder.BuildEngineApiClient;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineSystemMonitor
    {
        public IJobRepository<Organization> OrganizationRepository;
        public IJobRepository<SystemStatus> SystemStatusRepository;

        public IBuildEngineApi BuildEngineApi { get; }

        public BuildEngineSystemMonitor(
            IJobRepository<Organization> organizationRepository,
            IJobRepository<SystemStatus> systemStatusRepository,
            IBuildEngineApi buildEngineApi
        )
        {
            OrganizationRepository = organizationRepository;
            SystemStatusRepository = systemStatusRepository;
            BuildEngineApi = buildEngineApi;
        }
        public void CheckBuildEngineStatus()
        {
            // Hangfire methods cannot be async, hence the Waits
            SyncDatabaseTablesAsync().Wait();
            CheckSystemStatusesAsync().Wait();
        }
         private async System.Threading.Tasks.Task SyncDatabaseTablesAsync()
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
        private async System.Threading.Tasks.Task CheckSystemStatusesAsync()
        {
            var systems = await SystemStatusRepository.GetListAsync();
            foreach (SystemStatus systemEntry in systems)
            {
                var available = CheckConnection(systemEntry);
                if (available != systemEntry.SystemAvailable)
                {
                    systemEntry.SystemAvailable = available;
                    await SystemStatusRepository.UpdateAsync(systemEntry);
                }
            }
        }
        private bool CheckConnection(SystemStatus systemEntry)
        {
            BuildEngineApi.SetEndpoint(systemEntry.BuildEngineUrl, systemEntry.BuildEngineApiAccessToken);
            var response = BuildEngineApi.SystemCheck();
            if (response == System.Net.HttpStatusCode.OK)
            {
                return true;
            }
            return false;
        }
    }
}
