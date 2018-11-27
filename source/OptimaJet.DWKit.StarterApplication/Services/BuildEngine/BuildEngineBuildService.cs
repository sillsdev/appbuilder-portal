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

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineBuildService: BuildEngineServiceBase
    {
        public IRecurringJobManager RecurringJobManager { get; }
        public WebRequestWrapper WebRequestWrapper { get; }
        public IJobRepository<Product, Guid> ProductRepository { get; }
        public IJobRepository<ProductArtifact> ProductArtifactRepository { get; }

        public BuildEngineBuildService(
            IRecurringJobManager recurringJobManager,
            IBuildEngineApi buildEngineApi,
            WebRequestWrapper webRequestWrapper,
            IJobRepository<Product, Guid> productRepository,
            IJobRepository<ProductArtifact> productArtifactRepository,
            IJobRepository<SystemStatus> systemStatusRepository
        ) : base(buildEngineApi, systemStatusRepository)
        {
            RecurringJobManager = recurringJobManager;
            WebRequestWrapper = webRequestWrapper;
            ProductRepository = productRepository;
            ProductArtifactRepository = productArtifactRepository;
        }
        public void CreateBuild(Guid productId)
        {
            CreateBuildAsync(productId).Wait();
        }
        public async Task CreateBuildAsync(Guid productId)
        {
            var product = await ProductRepository.Get()
                                                 .Where(p => p.Id == productId)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Organization)
                                                 .FirstOrDefaultAsync();
            if ((product == null) || (product.WorkflowJobId == 0))
            {
                // Can't find the product record associated with
                // this process or there is no job created for this product.
                // Exception will trigger retry
                // TODO: Send notification record
                // Don't send exception because there doesn't seem to be a point in retrying
                return;

            }
            if (!BuildEngineLinkAvailable(product.Project.Organization))
            {
                // If the build engine isn't available, there is no point in continuing
                // Notifications for this are handled by the monitor
                // Throw exception to retry
                throw new Exception("Connection not available");
            }
            await CreateBuildEngineBuildAsync(product);
            return;
        }
        public void CheckBuild(Guid productId)
        {
            CheckBuildAsync(productId).Wait();
        }
        public async Task CheckBuildAsync(Guid productId)
        {
            var product = await ProductRepository.Get()
                                                 .Where(p => p.Id == productId)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Organization)
                                                 .FirstOrDefaultAsync();
            if ((product == null) || (product.WorkflowJobId == 0))
            {
                // Can't find the product record associated with
                // this process or there is no job created for this product.
                // Exception will trigger retry
                // TODO: Send notification record
                // Don't send exception because there doesn't seem to be a point in retrying
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
        protected async Task CreateBuildEngineBuildAsync(Product product)
        {
            await ResetPreviousBuildAsync(product);
            BuildResponse buildResponse = null;
            if (SetBuildEngineEndpoint(product.Project.Organization))
            {
                buildResponse = BuildEngineApi.CreateBuild(product.WorkflowJobId);
            }
            if ((buildResponse != null) && (buildResponse.Id != 0))
            {
                product.WorkflowBuildId = buildResponse.Id;
                await ProductRepository.UpdateAsync(product);
                var monitorJob = Job.FromExpression<BuildEngineBuildService>(service => service.CheckBuild(product.Id));
                RecurringJobManager.AddOrUpdate(GetHangfireToken(product.Id), monitorJob, "* * * * *");
            }
            else
            {
                // TODO: Send Notification
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
                        BuildCreationFailed(product, buildEngineBuild);
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
            DateTime? mostRecentArtifactDate = new DateTime(2018, 10, 1);
            ClearRecurringJob(product.Id);
            if (buildEngineBuild.Artifacts != null)
            {
                foreach(KeyValuePair<string, string> entry in buildEngineBuild.Artifacts)
                {
                    var artifactModifiedDate = await AddProductArtifactAsync(entry.Key, entry.Value, product.Id);
                    if ((artifactModifiedDate != null) && (artifactModifiedDate > mostRecentArtifactDate))
                    {
                        mostRecentArtifactDate = artifactModifiedDate;
                    }
                }
            }
            product.DateBuilt = mostRecentArtifactDate;
            await ProductRepository.UpdateAsync(product);
        }
        protected void BuildCreationFailed(Product product, BuildResponse buildEngineBuild)
        {
            ClearRecurringJob(product.Id);
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
        protected async Task<DateTime?> AddProductArtifactAsync(string key, string value, Guid productId)
        {
            var productArtifact = new ProductArtifact
            {
                ProductId = productId,
                ArtifactType = key,
                Url = value
            };
            var updatedArtifact = WebRequestWrapper.GetFileInfo(productArtifact);
            await ProductArtifactRepository.CreateAsync(updatedArtifact);
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
