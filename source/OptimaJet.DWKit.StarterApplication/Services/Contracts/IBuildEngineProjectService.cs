using System.Threading.Tasks;
using Hangfire;
using Hangfire.Server;
using SIL.AppBuilder.BuildEngineApiClient;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public interface IBuildEngineProjectService
    {
        IRecurringJobManager RecurringJobManager { get; set; }
        SendNotificationService SendNotificationSvc { get; }

        Task<TokenResponse> GetProjectTokenAsync(int projectId, bool readOnly);
        void ManageProject(int projectId, PerformContext context);
        Task ManageProjectAsync(int projectId, PerformContext context);
    }
}