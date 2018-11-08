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

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineReleaseService : BuildEngineServiceBase
    {
        public IRecurringJobManager RecurringJobManager { get; }
        public IJobRepository<Product, Guid> ProductRepository { get; }
 
        public BuildEngineReleaseService(
            IRecurringJobManager recurringJobManager,
            IBuildEngineApi buildEngineApi,
            IJobRepository<Product, Guid> productRepository,
            IJobRepository<SystemStatus> systemStatusRepository
        ) : base(buildEngineApi, systemStatusRepository)
        {
            RecurringJobManager = recurringJobManager;
            ProductRepository = productRepository;
        }
        public void CreateRelease(Guid productId, string channel)
        {
            CreateReleaseAsync(productId, channel).Wait();
        }
        public void CheckRelease(Guid productId)
        {
            CheckReleaseAsync(productId).Wait();
        }
        public async Task CreateReleaseAsync(Guid productId, string channel)
        {
            var product = await ProductRepository.Get()
                                                 .Where(p => p.Id == productId)
                                                 .Include(p => p.Project)
                                                 .ThenInclude(pr => pr.Organization)
                                                 .FirstOrDefaultAsync();
            if ((product == null) || (product.WorkflowJobId == 0) || (product.WorkflowBuildId == 0))
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
            await CreateBuildEngineReleaseAsync(product, channel);
            return;
        }
        public async Task CheckReleaseAsync(Guid productId)
        {
            var product = await ProductRepository.Get()
                                     .Where(p => p.Id == productId)
                                     .Include(p => p.Project)
                                     .ThenInclude(pr => pr.Organization)
                                     .FirstOrDefaultAsync();
            if (product == null)
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

        protected async Task CreateBuildEngineReleaseAsync(Product product, string channel)
        {
            var release = new Release
            {
                Channel = channel
            };
            ClearRecurringJob(product.Id);
            SetBuildEngineEndpoint(product.Project.Organization);
            var releaseResponse = BuildEngineApi.CreateRelease(product.WorkflowJobId,
                                                               product.WorkflowBuildId,
                                                               release);
            if ((releaseResponse != null) && (releaseResponse.Id != 0))
            {
                product.WorkflowPublishId = releaseResponse.Id;
                await ProductRepository.UpdateAsync(product);
                var monitorJob = Job.FromExpression<BuildEngineReleaseService>(service => service.CheckRelease(product.Id));
                RecurringJobManager.AddOrUpdate(GetHangfireToken(product.Id), monitorJob, "* * * * *");
            }
            else
            {
                // TODO: Send Notification
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
                        ReleaseCreationFailed(product, buildEngineRelease);
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
        }
        protected void ReleaseCreationFailed(Product product, ReleaseResponse buildEngineRelease)
        {
            ClearRecurringJob(product.Id);
        }
        protected ReleaseResponse GetBuildEngineRelease(Product product)
        {
            SetBuildEngineEndpoint(product.Project.Organization);
            var releaseResponse = BuildEngineApi.GetRelease(product.WorkflowJobId,
                                                            product.WorkflowBuildId,
                                                            product.WorkflowPublishId);
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

    }
}
