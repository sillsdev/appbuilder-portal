using System;
using System.Linq;
using Hangfire;
using Job = Hangfire.Common.Job;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Utility;
using SIL.AppBuilder.BuildEngineApiClient;
using System.Threading.Tasks;
using Hangfire.Server;
using System.Collections.Generic;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineReleaseService : BuildEngineServiceBase
    {
        public SendNotificationService sendNotificationService;

        public IRecurringJobManager RecurringJobManager { get; }
        public IWebClient WebClient { get; }
        public IJobRepository<Product, Guid> ProductRepository { get; }
        public IJobRepository<ProductPublication> PublicationRepository { get; }
        public IJobRepository<ProductBuild> BuildRepository { get; }

        public BuildEngineReleaseService(
            IRecurringJobManager recurringJobManager,
            IBuildEngineApi buildEngineApi,
            SendNotificationService sendNotificationService,
            IWebClient webClient,
            IJobRepository<Product, Guid> productRepository,
            IJobRepository<SystemStatus> systemStatusRepository,
            IJobRepository<ProductPublication> publicationRepository,
            IJobRepository<ProductBuild> buildRepository
        ) : base(buildEngineApi, sendNotificationService, systemStatusRepository)
        {
            RecurringJobManager = recurringJobManager;
            this.sendNotificationService = sendNotificationService;
            WebClient = webClient;
            ProductRepository = productRepository;
            PublicationRepository = publicationRepository;
            BuildRepository = buildRepository;
        }
        public void CreateRelease(Guid productId, Dictionary<string, object> paramsDictionary, PerformContext context)
        {
            CreateReleaseAsync(productId, paramsDictionary, context).Wait();
        }
        public void CheckRelease(Guid productId)
        {
            CheckReleaseAsync(productId).Wait();
        }
        public async Task CreateReleaseAsync(Guid productId, Dictionary<string, object> paramsDictionary, PerformContext context)
        {
            var product = await ProductRepository.Get()
                                                 .Where(p => p.Id == productId)
                                                 .Include(p => p.ProductDefinition)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Organization)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Owner)
                                                 .FirstOrDefaultAsync();
            if ((product == null) || (product.WorkflowJobId == 0) || (product.WorkflowBuildId == 0))
            {
                // Can't find the product record associated with
                // this process or there is no job created for this product.
                // Exception will trigger retry
                // Don't send exception because there doesn't seem to be a point in retrying
                var messageParms = new Dictionary<string, object>
                {
                    { "productId", productId.ToString() }
                };
                await sendNotificationService.SendNotificationToSuperAdminsAsync("releaseProductRecordNotFound",
                                                                               messageParms);

                return;

            }
            if (!BuildEngineLinkAvailable(product.Project.Organization))
            {
                // If the build engine isn't available, there is no point in continuing
                // Throw exception to retry
                var messageParms = new Dictionary<string, object>()
                    {
                        { "projectName", product.Project.Name },
                        { "productName", product.ProductDefinition.Name}
                    };
                await SendNotificationOnFinalRetryAsync(context, product.Project.Organization, product.Project.Owner, "releaseFailedUnableToConnect", messageParms);
                throw new Exception("Connection not available");
            }
            await CreateBuildEngineReleaseAsync(product, paramsDictionary, context);
            return;
        }
        public async Task CheckReleaseAsync(Guid productId)
        {
            var product = await ProductRepository.Get()
                                                 .Where(p => p.Id == productId)
                                                 .Include(p => p.ProductDefinition)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Organization)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Owner)
                                                 .FirstOrDefaultAsync();
            if (product == null)
            {
                // Can't find the product record associated with
                // this process or there is no job created for this product.
                // Exception will trigger retry
                // Don't send exception because there doesn't seem to be a point in retrying
                var messageParms = new Dictionary<string, object>()
                    {
                        { "productId", productId.ToString()}
                    };
                await sendNotificationService.SendNotificationToSuperAdminsAsync("releaseProductRecordNotFound",
                                                                               messageParms);
                ClearRecurringJob(productId);
                return;

            }
            // Since this is a recurring task, there is no need to throw an exception
            // if the link is unavailable.  It will retry 
            if (BuildEngineLinkAvailable(product.Project.Organization))
            {
                await CheckExistingReleaseAsync(product);
            }
            return;

        }
        public async Task<BuildEngineStatus> GetStatusAsync(Guid productId)
        {
            var product = await ProductRepository.Get()
                                                 .Where(p => p.Id == productId)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Organization)
                                                 .FirstOrDefaultAsync();
            if ((product == null) || (product.WorkflowJobId == 0) || (product.WorkflowBuildId == 0) || (product.WorkflowPublishId == 0))
            {
                return BuildEngineStatus.Unavailable;
            }
            if (!BuildEngineLinkAvailable(product.Project.Organization))
            {
                return BuildEngineStatus.Unavailable;
            }
            var buildEngineRelease = GetBuildEngineRelease(product);
            if ((buildEngineRelease == null) || (buildEngineRelease.Id == 0))
            {
                return BuildEngineStatus.Unavailable;
            }
            switch (buildEngineRelease.Status)
            {
                case "initialized":
                case "active":
                case "postprocessing":
                    return BuildEngineStatus.InProgress;
                case "completed":
                    return (buildEngineRelease.Result == "SUCCESS") ? BuildEngineStatus.Success : BuildEngineStatus.Failure;
                default:
                    return BuildEngineStatus.Unavailable;
            }
        }

        protected async Task CreateBuildEngineReleaseAsync(Product product, Dictionary<string, object> paramsDictionary, PerformContext context)
        {
            var channel = GetChannel(paramsDictionary);
            var targets = GetTargets(paramsDictionary, "google-play");
            var environment = GetEnvironment(paramsDictionary);
            var release = new Release
            {
                Channel = channel,
                Targets = targets,
                Environment = environment
            };
            ClearRecurringJob(product.Id);
            ReleaseResponse releaseResponse = null;
            if (SetBuildEngineEndpoint(product.Project.Organization))
            {
                releaseResponse = BuildEngineApi.CreateRelease(product.WorkflowJobId,
                                                                   product.WorkflowBuildId,
                                                                   release);
            }
            if ((releaseResponse != null) && (releaseResponse.Id != 0))
            {
                product.WorkflowPublishId = releaseResponse.Id;
                await ProductRepository.UpdateAsync(product);

                var build = await BuildRepository.Get().Where(b => b.BuildId == product.WorkflowBuildId).FirstOrDefaultAsync();
                if (build == null)
                {
                    throw new Exception($"Failed to find ProductBuild: {product.WorkflowBuildId}");
                }
                var publish = new ProductPublication
                {
                    ProductId = product.Id,
                    ProductBuildId = build.Id,
                    ReleaseId = releaseResponse.Id,
                    Channel = channel
                };
                await PublicationRepository.CreateAsync(publish);

                var monitorJob = Job.FromExpression<BuildEngineReleaseService>(service => service.CheckRelease(product.Id));
                RecurringJobManager.AddOrUpdate(GetHangfireToken(product.Id), monitorJob, "* * * * *");
            }
            else
            {
                var messageParms = new Dictionary<string, object>()
                    {
                        { "projectName", product.Project.Name },
                        { "productName", product.ProductDefinition.Name}
                    };
                await SendNotificationOnFinalRetryAsync(context, product.Project.Organization, product.Project.Owner, "releaseFailedUnableToCreate", messageParms);
                // Throw Exception to force retry
                throw new Exception("Create release failed");
            }
        }
        protected async Task CheckExistingReleaseAsync(Product product)
        {
            var buildEngineRelease = GetBuildEngineRelease(product);
            if ((buildEngineRelease != null) && (buildEngineRelease.Id != 0))
            {
                if (buildEngineRelease.Status == "completed")
                {
                    if (buildEngineRelease.Result == "SUCCESS")
                    {
                        await ReleaseCompletedAsync(product, buildEngineRelease);
                    }
                    else
                    {
                        await ReleaseCreationFailedAsync(product, buildEngineRelease);
                    }
                }
            }
            // If not completed or if failed to get the build, retry in one minute
            return;
        }
        protected async Task ReleaseCompletedAsync(Product product, ReleaseResponse buildEngineRelease)
        {
            ClearRecurringJob(product.Id);
            product.DatePublished = DateTime.UtcNow;
            await ProductRepository.UpdateAsync(product);
            await UpdateProductPublication(buildEngineRelease, product, true);
            var messageParms = new Dictionary<string, object>()
            {
                { "projectName", product.Project.Name },
                { "productName", product.ProductDefinition.Name}
            };
            await sendNotificationService.SendNotificationToUserAsync(product.Project.Owner, "releaseCompletedSuccessfully", messageParms);
        }

        private async Task UpdateProductPublication(ReleaseResponse buildEngineRelease, Product product, bool success)
        {
            var publication = await PublicationRepository.Get().Where(p => p.ReleaseId == buildEngineRelease.Id && p.ProductId == product.Id).FirstOrDefaultAsync();
            if (publication == null)
            {
                throw new Exception($"Failed to find ProductPublish: ReleaseId={buildEngineRelease.Id}");
            }
            publication.Success = success;
            publication.LogUrl = buildEngineRelease.ConsoleText;
            await PublicationRepository.UpdateAsync(publication);

            if (success)
            {
                var publishUrlFile = buildEngineRelease.Artifacts.Where(pa => pa.Key == "publishUrl").FirstOrDefault();
                if (publishUrlFile.Value != null)
                {
                    var value = WebClient.DownloadString(publishUrlFile.Value);
                    if (!string.IsNullOrEmpty(value))
                    {
                        var publishUrl = value.Trim();
                        product.PublishLink = publishUrl;
                        await ProductRepository.UpdateAsync(product);
                    }
                }
            }
        }

        protected async Task ReleaseCreationFailedAsync(Product product, ReleaseResponse buildEngineRelease)
        {
            ClearRecurringJob(product.Id);
            await UpdateProductPublication(buildEngineRelease, product, false);
            var buildEngineUrl = product.Project.Organization.BuildEngineUrl;
            var consoleTextUrl = buildEngineRelease.ConsoleText;
            var messageParms = new Dictionary<string, object>()
            {
                { "projectName", product.Project.Name },
                { "productName", product.ProductDefinition.Name},
                { "releaseStatus", buildEngineRelease.Status },
                { "releaseError", buildEngineRelease.Error },
                { "buildEngineUrl", buildEngineUrl },
                { "consoleTextUrl", consoleTextUrl },
                { "jobId", product.WorkflowJobId },
                { "buildId", product.WorkflowBuildId },
                { "publishId", product.WorkflowPublishId }
            };
            await sendNotificationService.SendNotificationToOrgAdminsAndOwnerAsync(product.Project.Organization, product.Project.Owner, "releaseFailedOwner", "releaseFailedAdmin", messageParms, consoleTextUrl);
        }
        protected ReleaseResponse GetBuildEngineRelease(Product product)
        {
            ReleaseResponse releaseResponse = null;
            if (SetBuildEngineEndpoint(product.Project.Organization))
            {
                releaseResponse = BuildEngineApi.GetRelease(product.WorkflowJobId,
                                                                product.WorkflowBuildId,
                                                                product.WorkflowPublishId);
            }
            return releaseResponse;
        }
        protected String GetHangfireToken(Guid productId)
        {
            return "CreateReleaseMonitor" + productId.ToString();
        }
        protected void ClearRecurringJob(Guid productId)
        {
            var jobToken = GetHangfireToken(productId);
            RecurringJobManager.RemoveIfExists(jobToken);
            return;
        }
        protected static string GetChannel(Dictionary<string, object> paramsDict)
        {
            var retVal = "production";
            if (paramsDict.ContainsKey("channel"))
            {
                retVal = paramsDict["channel"] as string;
            }
            return retVal;
        }

    }
}
