using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.BuildEngineApiClient;
using BuildEngineJob = SIL.AppBuilder.BuildEngineApiClient.Job;
using OptimaJet.DWKit.StarterApplication.Repositories;
using System.Threading.Tasks;
using Hangfire;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineProductService: BuildEngineServiceBase
    {
        public BuildEngineProductService(
            IBuildEngineApi buildEngineApi,
            IJobRepository<Product> productRepository,
            IJobRepository<SystemStatus> systemStatusRepository
        ) : base(buildEngineApi, systemStatusRepository)
        {
            ProductRepository = productRepository;
        }

        public IJobRepository<Product> ProductRepository { get; }

        public static void CreateBuildEngineProduct(int productId)
        {
            BackgroundJob.Enqueue<BuildEngineProductService>(service => service.ManageProduct(productId));
        }
        public void ManageProduct(int productId)
        {
            ManageProductAsync(productId).Wait();
        }
        public async Task ManageProductAsync(int productId)
        {
            var product = await ProductRepository.Get()
                              .Where(p => p.Id == productId)
                              .Include(p => p.Project)
                                    .ThenInclude(pr => pr.Type)
                              .Include(p => p.Project)
                                    .ThenInclude(pr => pr.Organization)
                              .Include(p => p.Store)
                              .FirstOrDefaultAsync();
            if (product == null)
            {
                // TODO: Send notification record
                // Don't send exception because if the record is not there
                // there doesn't seem much point in retrying
                return;
            }
            if (!BuildEngineLinkAvailable(product.Project.Organization))
            {
                // If the build engine isn't available, there is no point in continuing
                // Notifications for this are handled by the monitor
                // Throw exception to retry
                throw new Exception("Connection not available");
            }
            await CreateBuildEngineProductAsync(product);

        }
        protected async Task CreateBuildEngineProductAsync(Product product)
        {
            var buildEngineJob = new BuildEngineJob
            {
                RequestId = product.Id.ToString(),
                GitUrl = product.Project.WorkflowProjectUrl,
                AppId = product.Project.Type.Name,
                PublisherId = product.Store.Name
            };
            SetBuildEngineEndpoint(product.Project.Organization);
            var jobResponse = BuildEngineApi.CreateJob(buildEngineJob);
            if ((jobResponse != null) && (jobResponse.Id != 0))
            {
                product.WorkflowJobId = jobResponse.Id;
                await ProductRepository.UpdateAsync(product);
                return;
            }
            else
            {
                // TODO: Send Notification
                throw new Exception("Create job failed");
            }
        }

    }
}
