using System;
using System.Collections.Generic;
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
        public IJobRepository<ProductWorkflow, Guid> ProductWorkflowRepository { get; }
        public IJobRepository<ProductTransition> ProductTransitionRepository { get; }
        public SendNotificationService SendNotificationService { get; }
        public WorkflowRuntime Runtime { get; }

        public WorkflowProductService(
            IJobRepository<Product, Guid> productRepository,
            IJobRepository<UserTask> taskRepository,
            IJobRepository<User> userRepository,
            IJobRepository<ProductWorkflow, Guid> productWorkflowRepository,
            IJobRepository<ProductTransition> productTransitionRepository,
            SendNotificationService sendNotificationService,
            WorkflowRuntime runtime
        ) {
            ProductRepository = productRepository;
            TaskRepository = taskRepository;
            UserRepository = userRepository;
            ProductWorkflowRepository = productWorkflowRepository;
            ProductTransitionRepository = productTransitionRepository;
            SendNotificationService = sendNotificationService;
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
            await RecreatePreExecuteEntries(args.ProcessId);

            // Find the Product assoicated with the ProcessId
            var product = await ProductRepository.Get()
                 .Where(p => p.Id == args.ProcessId)
                 .Include(p => p.ProductDefinition)
                 .Include(p => p.Project)
                 .ThenInclude(pr => pr.Owner)
                 .FirstOrDefaultAsync();

            if (product == null)
            {
                Log.Error($"Could find Product for ProcessId={args.ProcessId}");
                return;
            }

            var tasks = await ReassignUserTasksForProduct(product, args);

            // Clear the WorkflowComment
            if (!String.IsNullOrWhiteSpace(product.WorkflowComment))
            {
                // Clear the comment
                product.WorkflowComment = "";
                await ProductRepository.UpdateAsync(product);
            }
        }

        public async Task<List<UserTask>> ReassignUserTasksForProduct(Product product, ProductProcessChangedArgs args = null)
        {
            var instance = await ProductWorkflowRepository.GetAsync(product.Id);

            var comment = GetCurrentTaskComment(product);

            await RemoveTasksByProductId(product.Id);

            // Find all users who could perform the current activity and create tasks for them
            var workflowUserIds = Runtime
                .GetAllActorsForDirectCommandTransitions(product.Id, activityName : instance.ActivityName)
                .ToList();

            var users = UserRepository.Get()
                .Where(u => workflowUserIds.Contains(u.WorkflowUserId.GetValueOrDefault().ToString()))
                .ToList();

            List<UserTask> result = new List<UserTask>();

            foreach (var user in users)
            {
                var userTask = new UserTask
                {
                    UserId = user.Id,
                    ProductId = product.Id,
                    ActivityName = instance.ActivityName,
                    Status = instance.StateName,
                    Comment = comment
                };

                var createdUserTask = await TaskRepository.CreateAsync(userTask);

                await SendNotificationForTask(userTask, user, product, args);

                result.Add(createdUserTask);
            }

            return result;
        }

        private async Task SendNotificationForTask (UserTask task, User user, Product product, ProductProcessChangedArgs args = null)
        {
            var messageParms = new Dictionary<string, object>() {
                { "activityName", task.ActivityName },
                { "project", product.Project.Name },
                { "productName", product.ProductDefinition.Name },
                { "fromActivity", args?.PreviousActivityName ?? "" },
                { "status", task.Status },
                { "originator", user.Name },
                { "to", product.Project.Owner.Name },
                { "comment", task.Comment ?? "" }
            };

            await SendNotificationService.SendNotificationToUserAsync(user,
                "userTaskAdded",
                messageParms);

            Log.Information($"Notification: user={user.Name}, command={args?.ExecutingCommand}, fromActivity:{args?.PreviousActivityName}, toActivity:{args?.CurrentState}, comment:{product.WorkflowComment}");
        }

        private string GetCurrentTaskComment(Product product)
        {

            var oldTasks = TaskRepository.Get().Where(t => t.ProductId == product.Id).ToList();
            
            // tasks all have the same comment - Chris
            if (oldTasks.Count == 0) {
                return product.WorkflowComment;
            }

            var taskComment = oldTasks[0].Comment;

            if (String.IsNullOrWhiteSpace(taskComment))
            {
                return product.WorkflowComment;
            }

            return taskComment;
        }

        protected async Task ClearPreExecuteEntries(Guid processId)
        {
            var emptyItems = ProductTransitionRepository.Get()
                .Where(pt => pt.WorkflowUserId == null && pt.ProductId == processId)
                .Select(pt => pt.Id).ToList();

            foreach (var item in emptyItems)
            {
                await ProductTransitionRepository.DeleteAsync(item);
            }
        }

        public async Task RecreatePreExecuteEntries(Guid processId)
        {
            await ClearPreExecuteEntries(processId);

            // Create PreExecute entries
            await Runtime.PreExecuteFromCurrentActivityAsync(processId);
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
