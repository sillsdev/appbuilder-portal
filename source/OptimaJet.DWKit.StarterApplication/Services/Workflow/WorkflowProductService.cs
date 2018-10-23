using System.Linq;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using System.Threading.Tasks;
using OptimaJet.DWKit.Application;
using OptimaJet.Workflow.Core.Runtime;
using System;

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowProductService
    {
        IJobRepository<Product> ProductRepository { get; set; }

        public WorkflowProductService(
            IJobRepository<Product> productRepository
        )
        {
            ProductRepository = productRepository;
        }


        public void ManageNewProduct(int productId)
        {
            ManageNewProductAsync(productId).Wait();
        }

        public async Task ManageNewProductAsync(int productId)
        {
            var product = await ProductRepository.Get()
                              .Where(p => p.Id == productId)
                              .Include(p => p.ProductDefinition)
                                    .ThenInclude(pd => pd.Workflow)
                              .Include(p => p.Project)
                                    .ThenInclude(pr => pr.Owner)
                              .FirstOrDefaultAsync();
            if (product == null)
            {
                // TODO: Send notification record
                // Don't send exception because if the record is not there
                // there doesn't seem much point in retrying
                return;
            }

            if (!product.Project.Owner.WorkflowUserId.HasValue)
            {
                // TODO: Send notification record
                // If user does not have a WorkflowUserId, then User to DwSecurityUser
                // synchronization is not working or hasn't been done yet?
                // Throw exception to retry
                throw new Exception("WorkflowUserId not available");
            }

            await CreateWorkflowProcessInstance(product);
        }

        protected async Task CreateWorkflowProcessInstance(Product product)
        {

            var processId = Guid.NewGuid();
            await WorkflowInit.Runtime.CreateInstanceAsync(
                new CreateInstanceParams(
                    product.ProductDefinition.Workflow.WorkflowScheme,
                    processId)
                    {
                        IdentityId = product.Project.Owner.WorkflowUserId.Value.ToString()
                    }
            );

            product.WorkflowProcessId = processId;
            await ProductRepository.UpdateAsync(product);
        }
    }
}
    