using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.BuildEngineApiClient;
using Hangfire;
using Job = Hangfire.Common.Job;
using OptimaJet.DWKit.StarterApplication.Repositories;
using System.Threading.Tasks;
using System.Collections.Generic;
using OptimaJet.DWKit.StarterApplication.Utility;
using Newtonsoft.Json;
using Serilog;
using Hangfire.Server;
using Newtonsoft.Json.Linq;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineBuildService: BuildEngineServiceBase
    {
        public IRecurringJobManager RecurringJobManager { get; }
        public WebRequestWrapper WebRequestWrapper { get; }
        public IWebClient WebClient { get; }
        public SendNotificationService SendNotificationSvc { get; }
        public IJobRepository<Product, Guid> ProductRepository { get; }
        public IJobRepository<ProductArtifact> ProductArtifactRepository { get; }
        public IJobRepository<ProductBuild> ProductBuildRepository { get; }
        public IJobRepository<StoreLanguage> LanguageRepository { get; }

        public BuildEngineBuildService(
            IRecurringJobManager recurringJobManager,
            IBuildEngineApi buildEngineApi,
            WebRequestWrapper webRequestWrapper,
            IWebClient webClient,
            SendNotificationService sendNotificationService,
            IJobRepository<Product, Guid> productRepository,
            IJobRepository<ProductArtifact> productArtifactRepository,
            IJobRepository<ProductBuild> productBuildRepository,
            IJobRepository<StoreLanguage> languageRepository,
            IJobRepository<SystemStatus> systemStatusRepository
        ) : base(buildEngineApi, sendNotificationService, systemStatusRepository)
        {
            RecurringJobManager = recurringJobManager;
            WebRequestWrapper = webRequestWrapper;
            WebClient = webClient;
            SendNotificationSvc = sendNotificationService;
            ProductRepository = productRepository;
            ProductArtifactRepository = productArtifactRepository;
            ProductBuildRepository = productBuildRepository;
            LanguageRepository = languageRepository;
        }
        public void CreateBuild(Guid productId, Dictionary<string, object> parmsDictionary, PerformContext context)
        {
            CreateBuildAsync(productId, parmsDictionary, context).Wait();
        }
        public async Task CreateBuildAsync(Guid productId, Dictionary<string, object> parmsDictionary, PerformContext context)
        {
            var product = await ProductRepository.Get()
                                                 .Where(p => p.Id == productId)
                                                 .Include(p => p.ProductDefinition)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Organization)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Owner)
                                                 .FirstOrDefaultAsync();
            if ((product == null) || (product.WorkflowJobId == 0))
            {
                // Can't find the product record associated with
                // this process or there is no job created for this product.
                // Exception will trigger retry
                // Don't send exception because there doesn't seem to be a point in retrying
                var messageParms = new Dictionary<string, object>
                {
                    { "productId", productId.ToString() }
                };
                await SendNotificationSvc.SendNotificationToSuperAdminsAsync("buildProductRecordNotFound",
                                                                               messageParms);

                return;
            }
            if (!BuildEngineLinkAvailable(product.Project.Organization))
            {
                // If the build engine isn't available, there is no point in continuing
                var messageParms = new Dictionary<string, object>()
                    {
                        { "projectName", product.Project.Name },
                        { "productName", product.ProductDefinition.Name}
                    };
                await SendNotificationOnFinalRetryAsync(context, product.Project.Organization, product.Project.Owner, "buildFailedUnableToConnect", messageParms);
                // Throw exception to retry
                throw new Exception("Connection not available");
            }

            // Clear current BuildId used by Workflow
            product.WorkflowBuildId = 0;
            await ProductRepository.UpdateAsync(product);

            await CreateBuildEngineBuildAsync(product, parmsDictionary, context);
        }

        public void CheckBuild(Guid productId)
        {
            CheckBuildAsync(productId).Wait();
        }
        public async Task CheckBuildAsync(Guid productId)
        {
            var product = await ProductRepository.Get()
                                                 .Where(p => p.Id == productId)
                                                 .Include(p => p.ProductDefinition)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Organization)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Owner)
                                                 .FirstOrDefaultAsync();
            if ((product == null) || (product.WorkflowJobId == 0))
            {
                // Can't find the product record associated with
                // this process or there is no job created for this product.
                // Exception will trigger retry
                // Don't send exception because there doesn't seem to be a point in retrying
                var messageParms = new Dictionary<string, object>()
                    {
                        { "productId", productId.ToString()}
                    };
                await SendNotificationSvc.SendNotificationToSuperAdminsAsync("buildProductRecordNotFound",
                                                                               messageParms);
                ClearRecurringJob(productId);
                return;

            }
            // Since this is a recurring task, there is no need to throw an exception
            // if the link is unavailable.  It will retry 
            if (BuildEngineLinkAvailable(product.Project.Organization))
            {
                await CheckExistingBuildAsync(product);
            }
            return;

        }
        /// <summary>
        /// Remove any artifacts from previous build with this product.
        /// Cancel any current Hangfire recurring job still in progress
        /// </summary>
        /// <param name="product">Product.</param>
        protected async Task ResetPreviousBuildAsync(Product product)
        {
            ClearRecurringJob(product.Id);
            if (product.WorkflowBuildId != 0)
            {
                product.WorkflowBuildId = 0;
                await ProductRepository.UpdateAsync(product);
                var artifacts = ProductArtifactRepository.Get()
                                                         .Where(p => p.ProductId == product.Id)
                                                         .AsEnumerable();
                foreach (var artifact in artifacts)
                {
                    await ProductArtifactRepository.DeleteAsync(artifact.Id);
                }
            }
        }
        protected async Task CreateBuildEngineBuildAsync(Product product, Dictionary<string, object> parmsDictionary, PerformContext context)
        {
            await ResetPreviousBuildAsync(product);
            BuildResponse buildResponse = null;
            if (SetBuildEngineEndpoint(product.Project.Organization))
            {
                var targets = GetTargets(parmsDictionary, "apk play-listing");
                var environment = GetEnvironment(parmsDictionary);
                var build = new Build
                {
                    Targets = targets,
                    Environment = environment
                };
                buildResponse = BuildEngineApi.CreateBuild(product.WorkflowJobId, build);
            }
            if ((buildResponse != null) && (buildResponse.Id != 0))
            {
                product.WorkflowBuildId = buildResponse.Id;
                var productBuild = new ProductBuild
                {
                    ProductId = product.Id,
                    BuildId = product.WorkflowBuildId
                };
                await ProductBuildRepository.CreateAsync(productBuild);
                await ProductRepository.UpdateAsync(product);
                var monitorJob = Job.FromExpression<BuildEngineBuildService>(service => service.CheckBuild(product.Id));
                RecurringJobManager.AddOrUpdate(GetHangfireToken(product.Id), monitorJob, "* * * * *");
            }
            else
            {
                var messageParms = new Dictionary<string, object>()
                    {
                        { "projectName", product.Project.Name },
                        { "productName", product.ProductDefinition.Name}
                    };
                await SendNotificationOnFinalRetryAsync(context, product.Project.Organization, product.Project.Owner, "buildFailedUnableToCreate", messageParms);
                // Throw Exception to force retry
                throw new Exception("Create build failed");
            }

        }
        protected async Task CheckExistingBuildAsync(Product product)
        {
            var buildEngineBuild = GetBuildEngineBuild(product);
            if ((buildEngineBuild != null) && (buildEngineBuild.Id != 0))
            {
                if (buildEngineBuild.Status == "completed")
                {
                    if (buildEngineBuild.Result == "SUCCESS")
                    {
                        await BuildCompletedAsync(product, buildEngineBuild);
                    }
                    else
                    {
                        await BuildCreationFailedAsync(product, buildEngineBuild);
                    }
                }
            }
            // If not completed or if failed to get the build, retry in one minute
            return;
        }
        protected BuildResponse GetBuildEngineBuild(Product product)
        {
            if (!SetBuildEngineEndpoint(product.Project.Organization))
            {
                return null;
            }
            var buildResponse = BuildEngineApi.GetBuild(product.WorkflowJobId, product.WorkflowBuildId);
            return buildResponse;
        }
        protected async Task BuildCompletedAsync(Product product, BuildResponse buildEngineBuild)
        {
            Log.Information($"BuildCompletedAsync: product={product.Id}, response:Id={buildEngineBuild.Id},Status={buildEngineBuild.Status},Result={buildEngineBuild.Result},Date={buildEngineBuild.Updated}");
            ClearRecurringJob(product.Id);
            await SaveArtifacts(product, buildEngineBuild);
            var messageParms = new Dictionary<string, object>()
            {
                { "projectName", product.Project.Name },
                { "productName", product.ProductDefinition.Name}
            };
            await SendNotificationSvc.SendNotificationToUserAsync(product.Project.Owner, "buildCompletedSuccessfully", messageParms);
            await UpdateProductBuild(buildEngineBuild, product, true);
        }

        private async Task SaveArtifacts(Product product, BuildResponse buildEngineBuild)
        {
            DateTime? mostRecentArtifactDate = new DateTime(2018, 10, 1);
            var productBuild = await ProductBuildRepository.Get()
                .Where(pb => pb.ProductId == product.Id && pb.BuildId == product.WorkflowBuildId)
                .FirstOrDefaultAsync();
            if (buildEngineBuild.Artifacts != null && productBuild != null)
            {
                foreach (KeyValuePair<string, string> entry in buildEngineBuild.Artifacts)
                {
                    Log.Information($"Artifact: key={entry.Key}, value={entry.Value}");
                    if (!String.IsNullOrEmpty(entry.Value))
                    {
                        var artifactModifiedDate = await AddProductArtifactAsync(entry.Key, entry.Value, product, productBuild);
                        if ((artifactModifiedDate != null) && (artifactModifiedDate > mostRecentArtifactDate))
                        {
                            mostRecentArtifactDate = artifactModifiedDate;
                        }
                    }
                }

                product.DateBuilt = mostRecentArtifactDate;
                await ProductRepository.UpdateAsync(product);
            }
        }

        protected async Task BuildCreationFailedAsync(Product product, BuildResponse buildEngineBuild)
        {
            ClearRecurringJob(product.Id);
            await SaveArtifacts(product, buildEngineBuild);
            var buildEngineUrl = product.Project.Organization.BuildEngineUrl + "/build-admin/view?id=" + product.WorkflowBuildId.ToString();
            var consoleTextUrl = buildEngineBuild.Artifacts["consoleText"];
            var messageParms = new Dictionary<string, object>()
            {
                { "projectName", product.Project.Name },
                { "productName", product.ProductDefinition.Name},
                { "buildStatus", buildEngineBuild.Status },
                { "buildError", buildEngineBuild.Error },
                { "buildEngineUrl", buildEngineUrl },
                { "consoleText", consoleTextUrl },
                { "projectId", product.ProjectId },
                { "jobId", product.WorkflowJobId},
                { "buildId", product.WorkflowBuildId}
            };
            await SendNotificationSvc.SendNotificationToOrgAdminsAndOwnerAsync(product.Project.Organization, product.Project.Owner, "buildFailedOwner", "buildFailedAdmin", messageParms, consoleTextUrl);
            await UpdateProductBuild(buildEngineBuild, product, false);
        }
        private async Task UpdateProductBuild(BuildResponse buildEngineBuild, Product product, bool success)
        {
            var build = await ProductBuildRepository.Get().Where(pb => pb.ProductId == product.Id && pb.BuildId == product.WorkflowBuildId).FirstOrDefaultAsync();
            if (build == null)
            {
                throw new Exception($"Failed to find ProductBuild: BuildId={buildEngineBuild.Id}");
            }
            build.Success = success;
            await ProductBuildRepository.UpdateAsync(build);
        }

        protected void ClearRecurringJob(Guid productId)
        {
            var jobToken = GetHangfireToken(productId);
            RecurringJobManager.RemoveIfExists(jobToken);
            return;
        }
        protected String GetHangfireToken(Guid productId)
        {
            return "CreateBuildMonitor" + productId.ToString();
        }
        protected async Task<DateTime?> AddProductArtifactAsync(string key, string value, Product product, ProductBuild productBuild)
        {
            var productArtifact = new ProductArtifact
            {
                ProductId = product.Id,
                ProductBuildId = productBuild.Id,
                ArtifactType = key,
                Url = value
            };
            var updatedArtifact = WebRequestWrapper.GetFileInfo(productArtifact);
            var existingArtifact = await ProductArtifactRepository
                .Get().Where(a => a.ProductId == product.Id && a.ProductBuildId == productBuild.Id && a.ArtifactType == key && a.Url == value)
                .FirstOrDefaultAsync();
            if (existingArtifact != null)
            {
                // Not sure why we are getting multiple of these, but we don't want multiple entries.
                // Should we ignore it or update?  Ignore for now. Updating threw exceptions
                Log.Information($"Updating Artifact: Id={existingArtifact.Id}");
                updatedArtifact.Id = existingArtifact.Id;
                // await ProductArtifactRepository.UpdateAsync(updatedArtifact);
            }
            else
            {
                var newArtifact = await ProductArtifactRepository.CreateAsync(updatedArtifact);
                Log.Information($"Created Artifact: Id={newArtifact.Id}");
            }

            // On version.json, update the ProductBuild.Version
            if (key == "version" && updatedArtifact.ContentType == "application/json")
            {
                try
                {
                    var contents = WebClient.DownloadString(value);
                    var version = JsonConvert.DeserializeObject<Dictionary<string, object>>(contents);
                    if (version.ContainsKey("version"))
                    {
                        productBuild.Version = version["version"] as String;
                        await ProductBuildRepository.UpdateAsync(productBuild);
                        product.VersionBuilt = version["version"] as String;
                        await ProductRepository.UpdateAsync(product);
                    }
                }
                catch (Exception ex)
                {
                    Log.Error(ex, $"Parsing {key}: {value}");
                }
            }

            // On play-listing-manifest.json, update the Project.DefaultLanguage
            if (key == "play-listing-manifest" && updatedArtifact.ContentType == "application/json")
            {
                try
                {
                    var contents = WebClient.DownloadString(value);
                    var manifest = JsonConvert.DeserializeObject<Dictionary<string, object>>(contents);
                    if (manifest.ContainsKey("default-language"))
                    {
                        var languageName = manifest["default-language"] as String;
                        StoreLanguage storeLanguage = await LanguageRepository.Get().Where(lang => lang.Name == languageName).FirstOrDefaultAsync();
                        if (storeLanguage != null)
                        {
                            product.StoreLanguageId = storeLanguage.Id;
                            await ProductRepository.UpdateAsync(product);
                        }
                    }

                }
                catch (Exception ex)
                {
                    Log.Error(ex, $"Parsing {key}: {value}");

                }
            }

            return updatedArtifact.LastModified;
        }
        public async Task<BuildEngineStatus> GetStatusAsync(Guid productId)
        {
            var product = await ProductRepository.Get()
                                                 .Where(p => p.Id == productId)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Organization)
                                                 .FirstOrDefaultAsync();
            if ((product == null) || (product.WorkflowJobId == 0) || (product.WorkflowBuildId == 0))
            {
                return BuildEngineStatus.Unavailable;
            }
            if (!BuildEngineLinkAvailable(product.Project.Organization))
            {
                return BuildEngineStatus.Unavailable;
            }
            var buildEngineBuild = GetBuildEngineBuild(product);
            if ((buildEngineBuild == null) || (buildEngineBuild.Id == 0))
            {
                return BuildEngineStatus.Unavailable;
            }
            switch (buildEngineBuild.Status)
            {
                case "initialized":
                case "active":
                case "postprocessing":
                    return BuildEngineStatus.InProgress;
                case "completed":
                    return (buildEngineBuild.Result == "SUCCESS") ? BuildEngineStatus.Success : BuildEngineStatus.Failure;
                default:
                    return BuildEngineStatus.Unavailable;
            }
        }
    }
}
