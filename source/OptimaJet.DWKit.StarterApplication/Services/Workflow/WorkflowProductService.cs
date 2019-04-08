using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.Application;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using OptimaJet.DWKit.StarterApplication.Utility;
using OptimaJet.Workflow.Core.Persistence;
using OptimaJet.Workflow.Core.Runtime;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowProductService
    {
        public class ProductActivityChangedArgs
        {
            public Guid ProcessId { get; set; }
            public string CurrentActivityName { get; set; }
            public string PreviousActivityName { get; set; }
            public string CurrentState { get; set; }
            public string PreviousState { get; set; }
            public string ExecutingCommand { get; set; }
        };

        public class ProductProcessChangedArgs
        {
            public Guid ProcessId { get; set; }
            public string OldStatus { get; set; }
            public string NewStatus { get; set; }
            public string SchemaCode { get; set; }
        }

        IJobRepository<Product, Guid> ProductRepository { get; set; }
        public IJobRepository<UserTask> TaskRepository { get; }
        public IJobRepository<User> UserRepository { get; }
        public IJobRepository<ProductWorkflow, Guid> ProductWorkflowRepository { get; }
        public IJobRepository<WorkflowDefinition> WorkflowDefinitionRepository { get; }
        public IJobRepository<ProductTransition> ProductTransitionRepository { get; }
        public IBackgroundJobClient BackgroundJobClient { get; }
        public SendNotificationService SendNotificationService { get; }
        public IServiceProvider ServiceProvider { get; }
        public WorkflowRuntime Runtime { get; }

        public WorkflowProductService(
            IJobRepository<Product, Guid> productRepository,
            IJobRepository<UserTask> taskRepository,
            IJobRepository<User> userRepository,
            IJobRepository<ProductWorkflow, Guid> productWorkflowRepository,
            IJobRepository<WorkflowDefinition> workflowDefinitionRepository,
            IJobRepository<ProductTransition> productTransitionRepository,
            IBackgroundJobClient backgroundJobClient,
            SendNotificationService sendNotificationService,
            IServiceProvider serviceProvider,
            WorkflowRuntime runtime
        ) {
            ProductRepository = productRepository;
            TaskRepository = taskRepository;
            UserRepository = userRepository;
            ProductWorkflowRepository = productWorkflowRepository;
            WorkflowDefinitionRepository = workflowDefinitionRepository;
            ProductTransitionRepository = productTransitionRepository;
            BackgroundJobClient = backgroundJobClient;
            SendNotificationService = sendNotificationService;
            ServiceProvider = serviceProvider;
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

        public void ProductActivityChanged(ProductActivityChangedArgs args)
        {
            ProductActivityChangedAsync(args).Wait();
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
                              .FirstOrDefaultAsync();

            if (product == null)
            {
                // TODO: Send notification record
                // Don't send exception because if the record is not there
                // there doesn't seem much point in retrying
                return;
            }

            await StartProductWorkflowAsync(productId, product.ProductDefinition.WorkflowId);
         }

        protected void DeleteWorkflowProcessInstance(Guid processId)
        {
            WorkflowInit.Runtime.DeleteInstance(processId);
        }

        protected async Task CreateWorkflowProcessInstance(Product product, WorkflowDefinition workflowDefinition)
        {
            var parms = new CreateInstanceParams(workflowDefinition.WorkflowScheme, product.Id)
            {
                IdentityId = product.Project.Owner.WorkflowUserId.Value.ToString()
            };

            await WorkflowInit.Runtime.CreateInstanceAsync(parms);
        }

        public async Task ProductProcessChangedAsync(ProductProcessChangedArgs args)
        {
            // Find the Product assoicated with the ProcessId
            var product = await ProductRepository.Get()
                .Where(p => p.Id == args.ProcessId)
                .FirstOrDefaultAsync();

            if (product == null)
            {
                Log.Error($"Could find Product for ProcessId={args.ProcessId}");
                return;
            }

            if (args.NewStatus == ProcessStatus.Finalized.StatusString())
            {
                Log.Information($"Process Finalized.  Deleting ProcessId={args.ProcessId}, Schema={args.SchemaCode}");
                await StopProductWorkflowAsync(args.ProcessId);
            }
        }

        public async Task ProductActivityChangedAsync(ProductActivityChangedArgs args)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
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

                await ReassignUserTasksForProduct(product);
                if (!String.IsNullOrWhiteSpace(product.WorkflowComment))
                {
                    BackgroundJobClient.Enqueue<BuildEngineProductService>(service => service.ClearComment(product.Id));
                }
            }

        }

        public async Task ReassignUserTasksForProduct(Product product)
        {
            await ClearPreExecuteEntries(product.Id);

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

                await TaskRepository.CreateAsync(userTask);

                await SendNotificationForTask(userTask, user, product);
            }

            await CreatePreExecuteEntries(product.Id);
        }

        public void StartProductWorkflow(Guid productId, int workflowDefinitionId)
        {
            StartProductWorkflowAsync(productId, workflowDefinitionId).Wait();
        }

        private async Task StartProductWorkflowAsync(Guid productId, int workflowDefinitionId)
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

            var workflowDefinition = await WorkflowDefinitionRepository.GetAsync(workflowDefinitionId);
            if (workflowDefinition == null)
            {
                // TODO: Send notification record
                // Don't send exception because if the record is not there
                // there doesn't seem much point in retrying
                return;
            }

            await CreateWorkflowProcessInstance(product, workflowDefinition);
        }

        private async Task SendNotificationForTask (UserTask task, User user, Product product)
        {
            var comment = task.Comment ?? "";
            var messageParms = new Dictionary<string, object>() {
                { "activityName", task.ActivityName },
                { "project", product.Project.Name },
                { "productName", product.ProductDefinition.Name },
                { "status", task.Status },
                { "originator", user.Name },
                { "to", product.Project.Owner.Name },
                { "comment", task.Comment ?? "" }
            };

            await SendNotificationService.SendNotificationToUserAsync(user,
                "userTaskAdded",
                messageParms);

            Log.Information($"Notification: task={task.Id}, user={user.Name}, product={product.Id}, messageParms={messageParms}");
        }

        public void StopProductWorkflow(Guid id)
        {
            StopProductWorkflowAsync(id).Wait();
        }

        private async Task StopProductWorkflowAsync(Guid processId)
        {
            // Remove any future transition entries
            await ClearPreExecuteEntries(processId);

            // Remove any tasks
            await RemoveTasksByProductId(processId);

            // Delete the ProcessInstance
            DeleteWorkflowProcessInstance(processId);
        }

        private string GetCurrentTaskComment(Product product)
        {

            var oldTasks = TaskRepository.Get().Where(t => t.ProductId == product.Id).ToList();
            
            // tasks all have the same comment - Chris
            if (oldTasks.Count == 0) {
                return product.WorkflowComment;
            }

            var taskComment = oldTasks[0].Comment;

            if (String.IsNullOrWhiteSpace(product.WorkflowComment))
            {
                return taskComment;
            }

            return product.WorkflowComment;
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

        public async Task CreatePreExecuteEntries(Guid processId)
        {
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
