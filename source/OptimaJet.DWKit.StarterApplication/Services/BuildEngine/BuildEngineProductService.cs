using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.BuildEngineApiClient;
using BuildEngineJob = SIL.AppBuilder.BuildEngineApiClient.Job;
using OptimaJet.DWKit.StarterApplication.Repositories;
using System.Threading.Tasks;
using Hangfire.Server;
using System.Collections.Generic;

namespace OptimaJet.DWKit.StarterApplication.Services.BuildEngine
{
    public class BuildEngineProductService: BuildEngineServiceBase
    {
        public readonly SendNotificationService sendNotificationService;

        public BuildEngineProductService(
            IBuildEngineApi buildEngineApi,
            SendNotificationService sendNotificationService,
            IJobRepository<Product, Guid> productRepository,
            IJobRepository<SystemStatus> systemStatusRepository
        ) : base(buildEngineApi, sendNotificationService, systemStatusRepository)
        {
            this.sendNotificationService = sendNotificationService;
            ProductRepository = productRepository;
        }

        public IJobRepository<Product, Guid> ProductRepository { get; }

        public void ManageProduct(Guid productId, PerformContext context)
        {
            ManageProductAsync(productId, null).Wait();
        }
        public async Task ManageProductAsync(Guid productId, PerformContext context)
        {
            var product = await ProductRepository.Get()
                              .Where(p => p.Id == productId)
                              .Include(p => p.Project)
                                    .ThenInclude(pr => pr.Type)
                              .Include(p => p.Project)
                                    .ThenInclude(pr => pr.Organization)
                              .Include(p => p.Project)
                                    .ThenInclude(pr => pr.Owner)
                              .Include(p => p.Store)
                              .FirstOrDefaultAsync();
            if (product == null)
            {
                // Don't send exception because if the record is not there
                // there doesn't seem much point in retrying
                var messageParms = new Dictionary<string, object>
                {
                    { "productId", productId.ToString() }
                };
                await sendNotificationService.SendNotificationToSuperAdminsAsync("productRecordNotFound",
                                                                               messageParms);
                return;
            }
            if (!BuildEngineLinkAvailable(product.Project.Organization))
            {
                // If the build engine isn't available, there is no point in continuing
                // Notifications for this are handled by the monitor
                var messageParms = new Dictionary<string, object>()
                    {
                        { "projectName", product.Project.Name },
                        { "productName", product.ProductDefinition.Name}
                    };
                await SendNotificationOnFinalRetryAsync(context, product.Project.Organization, product.Project.Owner, "productFailedUnableToConnect", messageParms);
                // Throw exception to retry
                throw new Exception("Connection not available");
            }
            if (!ProjectUrlSet(product.Project))
            {
                // If the Project URL is not set yet, then don't try to create the job.
                // Throw exception to retry
                var messageParms = new Dictionary<string, object>()
                    {
                        { "projectName", product.Project.Name },
                        { "productName", product.ProductDefinition.Name}
                    };
                await SendNotificationOnFinalRetryAsync(context, product.Project.Organization, product.Project.Owner, "productProjectUrlNotSet", messageParms);
                throw new Exception("Project URL not set");
            }
            await CreateBuildEngineProductAsync(product, context);
        }

        private bool ProjectUrlSet(Models.Project project)
        {
            return !String.IsNullOrEmpty(project.WorkflowProjectUrl);
        }

        protected async Task CreateBuildEngineProductAsync(Product product, PerformContext context)
        {
            var buildEngineJob = new BuildEngineJob
            {
                RequestId = product.Id.ToString(),
                GitUrl = product.Project.WorkflowProjectUrl,
                AppId = product.Project.Type.Name,
                PublisherId = product.Store.Name
            };
            JobResponse jobResponse = null;
            if (SetBuildEngineEndpoint(product.Project.Organization))
            {
                jobResponse = BuildEngineApi.CreateJob(buildEngineJob);
            }
            if ((jobResponse != null) && (jobResponse.Id != 0))
            {
                product.WorkflowJobId = jobResponse.Id;
                await ProductRepository.UpdateAsync(product);
                var messageParms = new Dictionary<string, object>()
                {
                    { "projectName", product.Project.Name },
                    { "productName", product.ProductDefinition.Name}
                };
                await sendNotificationService.SendNotificationToUserAsync(product.Project.Owner, "productCreatedSuccessfully", messageParms);
                return;
            }
            else
            {
                var buildEngineUrl = product.Project.Organization.BuildEngineUrl + "/job-admin";
                var messageParms = new Dictionary<string, object>()
                    {
                        { "projectName", product.Project.Name },
                        { "productName", product.ProductDefinition.Name},
                        { "buildEngineUrl", buildEngineUrl }
                    };
                await SendNotificationOnFinalRetryAsync(context, product.Project.Organization, product.Project.Owner, "productCreationFailedOwner", "productCreationFailedAdmin", messageParms, buildEngineUrl);
                throw new Exception("Create job failed");
            }
        }

    }
}
