using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.Application;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.Workflow.Core.Runtime;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowProductService
    {
        IJobRepository<Product> ProductRepository { get; set; }
        public IJobRepository<UserTask> TaskRepository { get; }
        public IJobRepository<User> UserRepository { get; }
        public WorkflowRuntime Runtime { get; }

        public WorkflowProductService(
            IJobRepository<Product> productRepository,
            IJobRepository<UserTask> taskRepository,
            IJobRepository<User> userRepository,
            WorkflowRuntime runtime
        )
        {
            ProductRepository = productRepository;
            TaskRepository = taskRepository;
            UserRepository = userRepository;
            Runtime = runtime;
        }


        public void ManageNewProduct(int productId)
        {
            ManageNewProductAsync(productId).Wait();
        }

        public void ManageDeletedProduct(Guid workflowProcessId)
        {
            DeleteWorkflowProcessInstance(workflowProcessId);
        }

        public void ProductProcessChanged(Guid workflowProcessId, string activityName, string currentState)
        {
            ProductProcessChangedAsync(workflowProcessId, activityName, currentState).Wait();
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

        protected void DeleteWorkflowProcessInstance(Guid processId)
        {
            WorkflowInit.Runtime.DeleteInstance(processId);
        }

        protected async Task CreateWorkflowProcessInstance(Product product)
        {

            var processId = Guid.NewGuid();
            Task createInstance = WorkflowInit.Runtime.CreateInstanceAsync(
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

        public async Task ProductProcessChangedAsync(Guid workflowProcessId, string activityName, string currentState)
        {
            // Find the Product assoicated with the ProcessId
            var product = await ProductRepository.Get().Where(p => p.WorkflowProcessId == workflowProcessId).FirstOrDefaultAsync();
            if (product == null)
            {
                Log.Error($"Could find Product for ProcessId={workflowProcessId}");
                return;
            }

            await RemoveTasksByProductId(product.Id);

            // Find all users who could perform the current activity and create tasks for them
            var workflowUserIds = Runtime.GetAllActorsForDirectCommandTransitions(workflowProcessId, activityName: activityName).ToList();
            var users = UserRepository.Get().Where(u => workflowUserIds.Contains(u.WorkflowUserId.GetValueOrDefault().ToString())).ToList();
            foreach (var user in users)
            {
                var task = new UserTask
                {
                    UserId = user.Id,
                    ProductId = product.Id,
                    ActivityName = activityName,
                    Status = currentState
                };
                task = await TaskRepository.CreateAsync(task);
            }

        }

        private async Task RemoveTasksByProductId(int productId)
        {
            // Remove all the current tasks associated with the Product
            var tasks = TaskRepository.Get().Where(t => t.ProductId == productId);
            foreach (var task in tasks)
            {
                await TaskRepository.DeleteAsync(task.Id);
            }
        }
    }
}
    
