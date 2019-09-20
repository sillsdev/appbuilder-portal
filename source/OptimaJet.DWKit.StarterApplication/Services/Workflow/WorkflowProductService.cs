using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
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
        public enum TransitionType
        {
            Continuation = 0,
            Reverse = 1,
            Rejection = 2,
            Other = 3
        }
        public class ProductActivityChangedArgs
        {
            public Guid ProcessId { get; set; }
            public string CurrentActivityName { get; set; }
            public string PreviousActivityName { get; set; }
            public string CurrentState { get; set; }
            public string PreviousState { get; set; }
            public string ExecutingCommand { get; set; }
            public TransitionType TransitionType { get; set; }
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
        public Bugsnag.IClient BugsnagClient { get; }
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
            Bugsnag.IClient bugsnagClient,
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
            BugsnagClient = bugsnagClient;
            Runtime = runtime;
        }

        public void ManageNewProduct(Guid productId)
        {
            ManageNewProductAsync(productId).Wait();
        }

        public void ManageDeletedProduct(Guid workflowProcessId, int projectId)
        {
            DeleteWorkflowProcessInstance(workflowProcessId, projectId);
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

        protected void DeleteWorkflowProcessInstance(Guid processId, int projectId)
        {
            WorkflowInit.Runtime.DeleteInstance(processId);
            BackgroundJobClient.Enqueue<WorkflowProjectService>(service => service.UpdateProjectActive(projectId));
        }

        protected async Task CreateWorkflowProcessInstance(Product product, WorkflowDefinition workflowDefinition)
        {
            var parms = new CreateInstanceParams(workflowDefinition.WorkflowScheme, product.Id)
            {
                IdentityId = product.Project.Owner.WorkflowUserId.Value.ToString()
            };

            SetProcessProperties(parms, workflowDefinition);

            await WorkflowInit.Runtime.CreateInstanceAsync(parms);
            BackgroundJobClient.Enqueue<WorkflowProjectService>(service => service.UpdateProjectActive(product.ProjectId));
        }

        private void SetProcessProperties(CreateInstanceParams parms, WorkflowDefinition workflowDefinition)
        {
            if (!string.IsNullOrWhiteSpace(workflowDefinition.Properties))
            {
                try
                {
                    // ProcessParameters are Dictionary<string,object>
                    // The values are expected to be strings (our decision, not a DWKit limitation)
                    // The result of the deserialize is a Newtonsoft.Json.Linq.JObject and I didn't want to specify that as the datatype in DWKit
                    var properties = JsonConvert.DeserializeObject<Dictionary<string, object>>(workflowDefinition.Properties);
                    // This converts the value back into JSON
                    var parameters = properties.ToDictionary(kv => kv.Key, kv => (object)kv.Value.ToString());
                    parms.InitialProcessParameters = parameters;
                }
                catch (Exception ex)
                {
                    BugsnagClient.Notify(ex);
                }
            }
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
                await StopProductWorkflowAsync(args.ProcessId, product.ProjectId, ProductTransitionType.EndWorkflow);
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

                var comment = await ReassignUserTasksForProduct(product);
                if (args.TransitionType == TransitionType.Rejection)
                {
                    BackgroundJobClient.Enqueue<SendEmailService>(service => service.SendRejectEmail(product.Id, args, comment));
                }
                if (!String.IsNullOrWhiteSpace(product.WorkflowComment))
                {
                    BackgroundJobClient.Enqueue<BuildEngineProductService>(service => service.ClearComment(product.Id));
                }
            }

        }

        public async Task<string> ReassignUserTasksForProduct(Product product)
        {
            var instance = await ProductWorkflowRepository.GetAsync(product.Id);
            if (instance == null)
            {
                // No current running workflow for product.
                return null;
            }

            await ClearPreExecuteEntries(product.Id);

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
            return comment;
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

            await createTransitionRecord(product.Id, ProductTransitionType.StartWorkflow, workflowDefinition.Type);

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

        public void StopProductWorkflow(Guid productId, int projectId, ProductTransitionType transitionType)
        {
            StopProductWorkflowAsync(productId, projectId, transitionType).Wait();
        }

        private async Task StopProductWorkflowAsync(Guid productId, int projectId, ProductTransitionType transitionType)
        {
            // Remove any future transition entries
            await ClearPreExecuteEntries(productId);

            // Remove any tasks
            await RemoveTasksByProductId(productId);

            var workflowDefinition = await GetExecutingWorkflowDefintion(productId);

            await createTransitionRecord(productId, transitionType, workflowDefinition.Type);

            // Delete the ProcessInstance
            DeleteWorkflowProcessInstance(productId, projectId);
        }

        private async Task createTransitionRecord(Guid processId, ProductTransitionType transitionType, WorkflowType workflowType)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productTransitionsRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<ProductTransition>>();
                var transition = new ProductTransition
                {
                    ProductId = processId,
                    AllowedUserNames = String.Empty,
                    TransitionType = transitionType,
                    WorkflowType = workflowType,
                    DateTransition = DateTime.UtcNow
                };
                transition = await productTransitionsRepository.CreateAsync(transition);

            }
        }
        private string GetCurrentTaskComment(Product product)
        {

            var mostRecentCommand = ProductTransitionRepository.Get()
                .Where(pt => pt.ProductId == product.Id && pt.Command != null)
                .OrderByDescending(a => a.DateTransition)
                .FirstOrDefault();
            return mostRecentCommand == null ? "" : mostRecentCommand.Comment;
        }

        protected async Task ClearPreExecuteEntries(Guid processId)
        {
            var emptyItems = ProductTransitionRepository.Get()
                .Where(pt => pt.WorkflowUserId == null && pt.ProductId == processId && pt.DateTransition == null)
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
        private async Task<WorkflowDefinition> GetExecutingWorkflowDefintion(Guid productId)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var product = await ProductRepository.Get()
                    .Where(p => p.Id == productId)
                    .Include(p => p.ProductWorkflow)
                        .ThenInclude(pw => pw.Scheme)
                    .FirstOrDefaultAsync();

                if (product == null)
                {
                    return null;
                }
                return await WorkflowDefinitionRepository.Get()
                    .Where(w => w.WorkflowScheme == product.ProductWorkflow.Scheme.SchemeCode)
                    .FirstOrDefaultAsync();
            }
        }

    }
}
