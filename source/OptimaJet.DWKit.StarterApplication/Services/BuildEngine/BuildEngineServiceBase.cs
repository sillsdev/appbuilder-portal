using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire.Server;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
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
        protected async Task SendNotificationOnFinalRetryAsync(PerformContext context,
                                                    Organization organization,
                                                    User user,
                                                    string messageId,
                                                    Dictionary<string, object> subs)
        {
            await SendNotificationOnFinalRetryAsync(context, organization, user, messageId, messageId, subs, "");
        }
        protected async Task SendNotificationOnFinalRetryAsync(PerformContext context,
                                                    Organization organization,
                                                    User user,
                                                    string ownerMessageId,
                                                    string adminMessageId,
                                                    Dictionary<string, object> subs,
                                                    string linkUrl)
        {
            if (IsFinalRetry(context))
            {
                await SendNotificationService.SendNotificationToOrgAdminsAndOwnerAsync(organization, user,
                                                               ownerMessageId, adminMessageId, subs, linkUrl);

            }
        }

        protected static void AddProductProperitiesToEnvironment(Dictionary<string, string> environment, Product product, Dictionary<string, object> paramsDict)
        {
            string uiUrl = GetVarOrDefault("UI_URL", "http://localhost:9091");
            string projectUrl = uiUrl + "/projects/" + product.ProjectId;

            environment["UI_URL"] = uiUrl;
            environment["PRODUCT_ID"] = product.Id.ToString();
            environment["PROJECT_ID"] = product.ProjectId.ToString();
            environment["PROJECT_NAME"] = product.Project.Name;
            environment["PROJECT_DESCRIPTION"] = product.Project.Description;
            environment["PROJECT_URL"] = projectUrl;
            environment["PROJECT_LANGUAGE"] = product.Project.Language;
            environment["PROJECT_ORGANIZATION"] = product.Project.Organization.Name;
            environment["PROJECT_OWNER_NAME"] = product.Project.Owner.Name;
            environment["PROJECT_OWNER_EMAIL"] = product.Project.Owner.Email;

        }
        protected static Dictionary<string, string> GetEnvironment(Dictionary<string, object> paramsDict)
        {
            var environment = new Dictionary<string, string>();
            if (paramsDict.ContainsKey("environment"))
            {
                var myObject = paramsDict["environment"] as JObject;
                environment = myObject.ToObject<Dictionary<string, string>>();
            }
            return environment;
        }
        protected static string GetTargets(Dictionary<string, object> paramsDict, string defaultValue)
        {
            var retVal = defaultValue;
            if (paramsDict.ContainsKey("targets"))
            {
                retVal = paramsDict["targets"] as string;
            }
            return retVal;
        }
    }
}
