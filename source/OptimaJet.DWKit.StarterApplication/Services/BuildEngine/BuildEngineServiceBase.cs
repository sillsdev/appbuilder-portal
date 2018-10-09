using System.Linq;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using SIL.AppBuilder.BuildEngineApiClient;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineServiceBase
    {
        public BuildEngineServiceBase(
            IBuildEngineApi buildEngineApi,
            IJobRepository<SystemStatus> systemStatusRepository
        )
        {
            BuildEngineApi = buildEngineApi;
            SystemStatusRepository = systemStatusRepository;
        }

        public IBuildEngineApi BuildEngineApi { get; }
        public IJobRepository<SystemStatus> SystemStatusRepository { get; }

        protected bool BuildEngineLinkAvailable(Organization organization)
        {
            var systemStatus = SystemStatusRepository.Get()
                 .Where(ss => (ss.BuildEngineApiAccessToken == organization.BuildEngineApiAccessToken)
                        && (ss.BuildEngineUrl == organization.BuildEngineUrl))
                 .FirstOrDefaultAsync().Result;

            if (systemStatus == null)
            {
                // TODO: Send Notification
                return false;
            }

            return systemStatus.SystemAvailable;
        }
        protected void SetBuildEngineEndpoint(Organization organization)
        {
            BuildEngineApi.SetEndpoint(organization.BuildEngineUrl, organization.BuildEngineApiAccessToken);
        }

    }
}
