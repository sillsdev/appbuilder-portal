using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.Application;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.Workflow.Core.Runtime;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowProductService
    {
        public class ProductProcessChangedArgs
        {
            public Guid ProcessId { get; set; }
            public string CurrentActivityName { get; set; }
            public string PreviousActivityName { get; set; }
            public string CurrentState { get; set; }
            public string PreviousState { get; set; }
            public string ExecutingCommand { get; set; }
        };

        IJobRepository<Product, Guid> ProductRepository { get; set; }
        public IJobRepository<UserTask> TaskRepository { get; }
        public IJobRepository<User> UserRepository { get; }
        public IJobRepository<ProductTransition> ProductTransitionRepository { get; }
        public WorkflowRuntime Runtime { get; }

        public WorkflowProductService(
            IJobRepository<Product, Guid> productRepository,
            IJobRepository<UserTask> taskRepository,
            IJobRepository<User> userRepository,
            IJobRepository<ProductTransition> productTransitionRepository,
            WorkflowRuntime runtime
        )
        {
            ProductRepository = productRepository;
            TaskRepository = taskRepository;
            UserRepository = userRepository;
            ProductTransitionRepository = productTransitionRepository;
            Runtime = runtime;
        }


        public void ManageNewProduct(Guid productId)
        {
            ManageNewProductAsync(productId).Wait();
        }

        public void ManageDeletedProduct(Guid workflowProcessId)
        {
            DeleteWorkflowProcessInstance(workflowProcessId);
        }

        public void ProductProcessChanged(ProductProcessChangedArgs args)
        {
            ProductProcessChangedAsync(args).Wait();
        }



        public async Task ManageNewProductAsync(Guid productId)
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
            await WorkflowInit.Runtime.CreateInstanceAsync(
                new CreateInstanceParams(
                    product.ProductDefinition.Workflow.WorkflowScheme,
                    product.Id)
                    {
                        IdentityId = product.Project.Owner.WorkflowUserId.Value.ToString()
                    }
            );
        }

        public async Task ProductProcessChangedAsync(ProductProcessChangedArgs args)
        {
            // Clear PreExecute entries
            var emptyItems = ProductTransitionRepository.Get()
                .Where(pt => pt.WorkflowUserId == null && pt.ProductId == args.ProcessId)
                .Select(pt => pt.Id).ToList();
            foreach (var item in emptyItems)
            {
                await ProductTransitionRepository.DeleteAsync(item);
            }
            // Create PreExecute entries
            await Runtime.PreExecuteFromCurrentActivityAsync(args.ProcessId);

            // Find the Product assoicated with the ProcessId
            var product = await ProductRepository.Get().Where(p => p.Id == args.ProcessId).FirstOrDefaultAsync();
            if (product == null)
            {
                Log.Error($"Could find Product for ProcessId={args.ProcessId}");
                return;
            }

            await RemoveTasksByProductId(product.Id);

            // Find all users who could perform the current activity and create tasks for them
            var workflowUserIds = Runtime.GetAllActorsForDirectCommandTransitions(args.ProcessId, activityName: args.CurrentActivityName).ToList();
            var users = UserRepository.Get().Where(u => workflowUserIds.Contains(u.WorkflowUserId.GetValueOrDefault().ToString())).ToList();
            var workflowComment = product.WorkflowComment;
            foreach (var user in users)
            {
                var task = new UserTask
                {
                    UserId = user.Id,
                    ProductId = product.Id,
                    ActivityName = args.CurrentActivityName,
                    Status = args.CurrentState,
                    Comment = workflowComment
                };
                task = await TaskRepository.CreateAsync(task);

                // TODO: SendNotification to User
                Log.Information($"Notification: user={user.Name}, command={args.ExecutingCommand}, fromActivity:{args.PreviousActivityName}, toActivity:{args.CurrentState}, comment:{product.WorkflowComment}");
            }

            // Clear the WorkflowComment
            if (!String.IsNullOrWhiteSpace(workflowComment)) 
            {
                // Clear the comment
                product.WorkflowComment = "";
                await ProductRepository.UpdateAsync(product);
            }
        }

        private async Task RemoveTasksByProductId(Guid productId)
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
    
