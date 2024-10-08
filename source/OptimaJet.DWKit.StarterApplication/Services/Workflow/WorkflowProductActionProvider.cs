﻿using System;
using System.Collections.Generic;
using System.Linq;
using OptimaJet.Workflow.Core.Model;
using OptimaJet.Workflow.Core.Runtime;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Models;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Threading;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using Hangfire;
using OptimaJet.DWKit.Application;
using OptimaJet.DWKit.StarterApplication.Utility;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowProductActionProvider : IWorkflowActionProvider
    {
        private readonly string PUBLISH_GOOGLE_PLAY_DRAFT = "PUBLISH_GOOGLE_PLAY_DRAFT";
        private readonly string PUBLISH_GOOGLE_PLAY_UPLOADED_BUILD_ID = "PUBLISH_GOOGLE_PLAY_UPLOADED_BUILD_ID";
        private readonly string PUBLISH_GOOGLE_PLAY_UPLOADED_VERSION_CODE = "PUBLISH_GOOGLE_PLAY_UPLOADED_VERSION_CODE";
        private readonly string GOOGLE_PLAY_DRAFT = "google_play_draft";
        private readonly string GOOGLE_PLAY_UPLOADED = "google_play_uploaded";
        private readonly string GOOGLE_PLAY_EXISTING = "google_play_existing";
        private readonly string AUTHOR_CAN_UPLOAD = "author_can_upload";
        private readonly string ENVIRONMENT = "environment";
        private readonly Dictionary<string, Action<ProcessInstance, WorkflowRuntime, string>> _actions = new Dictionary<string, Action<ProcessInstance, WorkflowRuntime, string>>();

        private readonly Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task>> _asyncActions =
            new Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task>>();

        private readonly Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, bool>> _conditions =
            new Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, bool>>();

        private readonly Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task<bool>>> _asyncConditions =
            new Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task<bool>>>();

        public IServiceProvider ServiceProvider { get; }
        public IBackgroundJobClient BackgroundJobClient { get; }

        public WorkflowProductActionProvider(IServiceProvider serviceProvider, IBackgroundJobClient backgroundJobClient)
        {
            ServiceProvider = serviceProvider;
            BackgroundJobClient = backgroundJobClient;

            //Register your actions in _actions and _asyncActions dictionaries
            _asyncActions.Add("WriteProductTransition", WriteProductTransitionAsync);
            _asyncActions.Add("UpdateProductTransition", UpdateProductTransitionAsync);
            _asyncActions.Add("SendOwnerNotification", SendOwnerNotificationAsync);
            _asyncActions.Add("BuildEngine_CreateProduct", BuildEngineCreateProductAsync);
            _asyncActions.Add("BuildEngine_BuildProduct", BuildEngineBuildProductAsync);
            _asyncActions.Add("BuildEngine_PublishProduct", BuildEnginePublishProductAsync);
            _asyncActions.Add("GooglePlay_UpdatePublishLink", NoOperationAsync);
            _asyncActions.Add("SendReviewerLinkToProductFiles", SendReviewerLinkToProductFilesAsync);
            _asyncActions.Add("Build_SetStatus", BuildSetStatusAsync);
            _asyncActions.Add("Project_SetStatus", ProjectSetStatusAsync);

            //Register your conditions in _conditions and _asyncConditions dictionaries
            //_asyncConditions.Add("CheckBigBossMustSign", CheckBigBossMustSignAsync);
            _asyncConditions.Add("BuildEngine_ProductCreated", BuildEngineProductCreated);
            _asyncConditions.Add("BuildEngine_BuildCompleted", BuildEngineBuildCompleted);
            _asyncConditions.Add("BuildEngine_BuildFailed", BuildEngineBuildFailed);
            _asyncConditions.Add("BuildEngine_PublishCompleted", BuildEnginePublishCompleted);
            _asyncConditions.Add("BuildEngine_PublishFailed", BuildEnginePublishFailed);
            _asyncConditions.Add("Build_AnyMatchingStatus", BuildAnyMatchingStatus);
            _asyncConditions.Add("Project_HasAuthors", ProjectHasAuthors);

            _conditions.Add("Should_Execute_Activity", ShouldExecuteActivity);
        }

        private async Task NoOperationAsync(ProcessInstance arg1, WorkflowRuntime arg2, string arg3, CancellationToken arg4)
        {
            await Task.CompletedTask;
        }

        //
        // Conditions
        //
        private bool ShouldExecuteActivity(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter)
        {
            if (string.IsNullOrWhiteSpace(actionParameter)) { return true; }
            if (!processInstance.IsParameterExisting("ShouldExecute")) { return true; }

            var parameter = processInstance.GetParameter<string>("ShouldExecute");
            if (string.IsNullOrWhiteSpace(parameter)) { return true; }

            var shouldExecuteMap = JsonConvert.DeserializeObject<Dictionary<string, object>>(parameter);
            if (   shouldExecuteMap != null
                && shouldExecuteMap.ContainsKey(actionParameter)
                && shouldExecuteMap[actionParameter] is bool shouldExecute)
            {
                return shouldExecute;
            }

            return true;
        }

        private async Task<bool> BuildEngineProductCreated(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                Log.Information($"BuildEngineProductCreated: workflowJobId={product.WorkflowJobId}, productId={product.Id}, projectName={product.Project.Name}");
                return product.WorkflowJobId != 0;
            }
        }

        private async Task<bool> BuildEngineBuildCompleted(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                Log.Information($"BuildEngineBuildCompleted: workflowJobId={product.WorkflowBuildId}, productId={product.Id}, projectName={product.Project.Name}");

                bool buildCompleted = false;
                if (product.WorkflowBuildId != 0)
                {
                    var service = scope.ServiceProvider.GetRequiredService<BuildEngineBuildService>();
                    var status = await service.GetStatusAsync(product.Id);
                    buildCompleted = (status == BuildEngineStatus.Success);
                }
                Log.Information($"BuildEngineBuildCompleted: {buildCompleted}");
                return buildCompleted;
            }
        }

        private async Task<bool> BuildEngineBuildFailed(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                Log.Information($"BuildEngineBuildFailed: workflowJobId={product.WorkflowBuildId}, productId={product.Id}, projectName={product.Project.Name}");

                bool buildFailed = false;
                if (product.WorkflowBuildId != 0)
                {
                    var service = scope.ServiceProvider.GetRequiredService<BuildEngineBuildService>();
                    var status = await service.GetStatusAsync(product.Id);
                    if (status == BuildEngineStatus.Failure)
                    {
                        buildFailed = true;
                        var consoleTextUrl = await service.GetConsoleText(product.Id);
                        product.WorkflowComment = "system.build-failed," + consoleTextUrl;
                        await productRepository.UpdateAsync(product);
                    }
                }
                Log.Information($"BuildEngineBuildFailed: {buildFailed}");
                return buildFailed;
            }
        }

        private async Task<bool> BuildEnginePublishCompleted(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                Log.Information($"BuildEnginePublishCompleted: workflowJobId={product.WorkflowBuildId}, productId={product.Id}, projectName={product.Project.Name}");

                bool publishCompleted = false;
                if (product.WorkflowPublishId != 0)
                {
                    var service = scope.ServiceProvider.GetRequiredService<BuildEngineReleaseService>();
                    var status = await service.GetStatusAsync(product.Id);
                    publishCompleted = (status == BuildEngineStatus.Success);
                }
                Log.Information($"BuildEnginePublishCompleted: {publishCompleted}");
                return publishCompleted;
            }
        }

        private async Task<bool> BuildEnginePublishFailed(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                Log.Information($"BuildEnginePublishFailed: workflowJobId={product.WorkflowBuildId}, productId={product.Id}, projectName={product.Project.Name}");

                bool publishFailed = false;
                if (product.WorkflowBuildId != 0)
                {
                    var service = scope.ServiceProvider.GetRequiredService<BuildEngineReleaseService>();
                    var status = await service.GetStatusAsync(product.Id);
                    if (status == BuildEngineStatus.Failure)
                    {
                        publishFailed = true;
                        var consoleTextUrl = await service.GetConsoleText(product.Id);
                        product.WorkflowComment = "system.publish-failed," + consoleTextUrl;
                        await productRepository.UpdateAsync(product);
                    }
                }
                Log.Information($"BuildEnginePublishFailed: {publishFailed}");

                return publishFailed;
            }
        }

        private async Task<bool> BuildAnyMatchingStatus(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            bool retval = false;
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                var workflowParams = GetWorkflowParameters(processInstance, null);
                var parmsDict = GetActionParameters(actionParameter);
                if (parmsDict.ContainsKey(GOOGLE_PLAY_UPLOADED))
                {
                    if (workflowParams.ContainsKey(ENVIRONMENT))
                    {
                        var environment = workflowParams[ENVIRONMENT] as JObject;
                        retval |= environment.ContainsKey(PUBLISH_GOOGLE_PLAY_UPLOADED_BUILD_ID);
                    }
                }
                if (parmsDict.ContainsKey(GOOGLE_PLAY_EXISTING))
                {
                    if (workflowParams.ContainsKey(ENVIRONMENT))
                    {
                        var environment = workflowParams[ENVIRONMENT] as JObject;
                        retval |= environment.ContainsKey(GOOGLE_PLAY_EXISTING);
                    }
                }
                if (parmsDict.ContainsKey(GOOGLE_PLAY_DRAFT))
                {
                    if (workflowParams.ContainsKey(ENVIRONMENT))
                    {
                        var environment = workflowParams[ENVIRONMENT] as JObject;
                        retval |= environment.ContainsKey(PUBLISH_GOOGLE_PLAY_DRAFT);
                    }
                }
            }
            return retval;
        }

        private async Task<bool> ProjectHasAuthors(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                var product = await GetProductForProcess(processInstance, productRepository);

                var authorsRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Author>>();
                var authors = await authorsRepository.Get()
                    .Where(a => a.ProjectId == product.ProjectId)
                    .ToListAsync();
                return (authors != null) && authors.Count > 0;
            }
        }

        //
        // Actions
        //
        private async Task BuildEngineCreateProductAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                if (product.WorkflowJobId == 0) 
                {
                    BackgroundJobClient.Enqueue<BuildEngineProductService>(service => service.ManageProduct(product.Id, null));
                    Log.Information($"BuildEngineCreateProduct: productId={product.Id}, projectName={product.Project.Name}");
                }
                else
                {
                    Log.Warning($"Product \"{product.Id}\" already has a BuildEngine Product \"{product.WorkflowJobId}\"");
                }
            }
        }

        private async Task BuildEngineBuildProductAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                if (product.WorkflowJobId != 0)
                {
                    product.WorkflowBuildId = 0;
                    await productRepository.UpdateAsync(product);
                    var parmsDict = GetParameters(processInstance, "build", actionParameter);
                    BackgroundJobClient.Enqueue<BuildEngineBuildService>(s => s.CreateBuild(product.Id, parmsDict, null));
                    Log.Information($"BuildEngineCreateBuild: productId={product.Id}, projectName={product.Project.Name}");
                }
                else 
                {
                    throw new Exception($"Product \"{product.Id}\" does not have BuildEngine Product");
                }
            }
        }

        private async Task BuildEnginePublishProductAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                if (product.WorkflowJobId != 0)
                {
                    product.WorkflowPublishId = 0;
                    await productRepository.UpdateAsync(product);
                    var parmsDict = GetParameters(processInstance, "publish", actionParameter);
                    BackgroundJobClient.Enqueue<BuildEngineReleaseService>(s => s.CreateRelease(product.Id, parmsDict, null));
                    Log.Information($"BuildEnginePublishProduct: productId={product.Id}, projectName={product.Project.Name}");
                }
                else
                {
                    throw new Exception($"Product \"{product.Id}\" does not have BuildEngine Product");
                }
            }
        }

        private static Dictionary<string, object> GetActionParameters(string actionParameter)
        {
            try
            {
                return JsonUtils.DeserializeProperties(actionParameter);
            }
            catch (Exception ex)
            {
                Log.Error($"Failed to parse actionParameters: {actionParameter}");
                throw ex;
            }
        }



        private static void AddKeyValueToParameters(Dictionary<string,object> parameters, string strKey, string strValue)
        {
            if (strValue.Contains("{"))
            {
                // Convert from JSON to Object
                var higherObject = JsonConvert.DeserializeObject(strValue) as JObject;
                if (parameters.ContainsKey(strKey))
                {
                    var baseObject = parameters[strKey] as JObject;
                    baseObject.Merge(higherObject, new JsonMergeSettings { MergeArrayHandling = MergeArrayHandling.Union });
                    parameters[strKey] = baseObject;
                }
                else
                {
                    parameters[strKey] = higherObject;
                }
            }
            else
            {
                // Use as string
                parameters[strKey] = strValue;
            }
        }

        private static Dictionary<string, object> GetWorkflowParameters(ProcessInstance processInstance, string scope)
        {
            var result = new Dictionary<string, object>();
            var scoped = new Dictionary<string, string>();
            foreach (var entry in processInstance.ProcessParameters.Where(p => p.Purpose != ParameterPurpose.System))
            {
                var strValue = entry.Value.ToString();
                var strKey = entry.Name;
                // Allow for scoped names so "build:targets" will become "targets"
                // Scoped values should be assigned after non-scoped
                if (strKey.Contains(":"))
                {
                    // Use scoped values for this scope and ignore others
                    if (scope != null && strKey.StartsWith(scope + ":"))
                    {
                        strKey = strKey.Split(":")[1];
                        scoped[strKey] = strValue;
                    }
                }
                else
                {
                    AddKeyValueToParameters(result, strKey, strValue);
                }
            }
            foreach (var entry in scoped)
            {
                AddKeyValueToParameters(result, entry.Key, entry.Value);
            }

            return result;
        }

        private static void MergeWorkflowParameter(ProcessInstance processInstance, string name, JObject value)
        {
            var workflowParams = GetWorkflowParameters(processInstance, null);
            JObject newParams = value;
            if (workflowParams.ContainsKey(name))
            {
                newParams = workflowParams[name] as JObject;
                newParams.Merge(value, new JsonMergeSettings { MergeArrayHandling = MergeArrayHandling.Merge });
            }
            var json = JsonConvert.SerializeObject(newParams);
            processInstance.SetParameter(name, json, ParameterPurpose.Persistence);
        }

        private static Dictionary<string, object> GetParameters(ProcessInstance processInstance, string scope, string actionParameters)
        {
            var actionParams = GetActionParameters(actionParameters);
            var workflowParams = GetWorkflowParameters(processInstance, scope);
            var resultParams = JsonUtils.MergeProperties(actionParams, workflowParams);
            return resultParams;
        }

        private static async Task<Product> GetProductForProcess(ProcessInstance processInstance, IJobRepository<Product, Guid> productRepository)
        {
            var product = await productRepository.Get()
                .Where(p => p.Id == processInstance.ProcessId)
                .Include(p => p.Project)
                    .ThenInclude(p => p.Owner)
                .FirstOrDefaultAsync();

            if (product == null)
            {
                throw new Exception($"No product found for {processInstance.ProcessId}");
            }

            return product;
        }

        private async Task ClearComment(ProcessInstance processInstance)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                if (!String.IsNullOrWhiteSpace(product.WorkflowComment))
                {
                    product.WorkflowComment = "";
                    await productRepository.UpdateAsync(product);
                }
            }
        }
        private async Task SendOwnerNotificationAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);

                var owner = product?.Project.Owner;

                //TODO: Send Notification to user
                Log.Information($"SendNotification: auth0Id={owner.ExternalId}, name={owner.Name}");
            }
        }

        private async Task SendReviewerLinkToProductFilesAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                var parmsDict = GetParameters(processInstance, "review", actionParameter);
                if (!String.IsNullOrEmpty(product.WorkflowComment))
                {
                    parmsDict.Add("Comment", product.WorkflowComment);
                }
                if (parmsDict.ContainsKey("types"))
                {
                    BackgroundJobClient.Enqueue<SendEmailService>(s => s.SendProductReviewEmail(product.Id, parmsDict));
                }
                else
                {
                    throw new Exception($"Product {product.Id}: Types not found in workflow action parameters");
                }
            }
        }

        private async Task BuildSetStatusAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                var parmsDict = GetActionParameters(actionParameter);
                if (parmsDict.ContainsKey(GOOGLE_PLAY_UPLOADED))
                {
                    var service = scope.ServiceProvider.GetRequiredService<BuildEngineBuildService>();
                    var versionCode = await service.GetVersionCodeAsync(product.Id);
                    var environment = new JObject();
                    environment.Add(PUBLISH_GOOGLE_PLAY_UPLOADED_BUILD_ID, product.WorkflowBuildId.ToString());
                    environment.Add(PUBLISH_GOOGLE_PLAY_UPLOADED_VERSION_CODE, versionCode.ToString());
                    MergeWorkflowParameter(processInstance, ENVIRONMENT, environment);
                }
                else if (parmsDict.ContainsKey(GOOGLE_PLAY_EXISTING))
                {
                    var environment = new JObject();
                    var value = parmsDict[GOOGLE_PLAY_EXISTING].ToString();
                    environment.Add(GOOGLE_PLAY_EXISTING, value);
                    MergeWorkflowParameter(processInstance, ENVIRONMENT, environment);
                }
                else if (parmsDict.ContainsKey(GOOGLE_PLAY_DRAFT))
                {
                    var environment = new JObject();
                    var value = parmsDict[GOOGLE_PLAY_DRAFT].ToString();
                    environment.Add(PUBLISH_GOOGLE_PLAY_DRAFT, value);
                    MergeWorkflowParameter(processInstance, ENVIRONMENT, environment);
                }
                else
                {
                    throw new Exception($"Product {product.Id}: unknown workflow action parameter: {actionParameter}");
                }
            }
        }

        private async Task ProjectSetStatusAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                var parmsDict = GetActionParameters(actionParameter);
                if (parmsDict.ContainsKey(AUTHOR_CAN_UPLOAD))
                {
                    if (int.TryParse(parmsDict[AUTHOR_CAN_UPLOAD].ToString(), out int value))
                    {
                        var authorRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Author>>();
                        var authors = await authorRepository.Get()
                                        .Where(a => a.ProjectId == product.ProjectId)
                                        .ToListAsync();
                        foreach (var author in authors)
                        {
                            author.CanUpdate = (value != 0);
                            await authorRepository.UpdateAsync(author);
                        }
                    }
                    else
                    {
                        throw new Exception($"Product {product.Id}: unable to parse value for workflow action parameter: {actionParameter}");
                    }
                }
                else
                {
                    throw new Exception($"Product {product.Id}: unknown workflow action parameter or bad value: {actionParameter}");
                }
            }

        }

        #region DWKit Execution Callbacks
        /*
            DWKit Activities have two callbacks: Implementation and PreExecution Implementation.

            For each Activity on the direct path through the workflow, these should be assigned:
            Implementation:              UpdateProductTransition
            PreExecution Implementation: WriteProductTransition

            The PreExecution Implementation callback is called for each Activity in the workflow when Runtime.PreExecuteFromCurrentActivityAsync is called.
            That Runtime function follows the Direct Transitions in the workflow to provide an estimation of the steps that will be performed in the workflow.
            Note: If there are Direct Auto-Action Transitions with a conditional that is considered the next step in the "happy path", then 
            the "Result on PreExecution" should be set to true so that the direct path will be followed.

            The Implementation callback is called while the workflow is running and the activity changes. It should update an existing ProductTransition.
        */
        private async Task WriteProductTransitionAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            if (processInstance.IdentityIds == null)
                return;

            var currentstate = processInstance.CurrentState;
            var nextState = processInstance.ExecutedActivityState;

            using (var scope = ServiceProvider.CreateScope())
            {
                // Only capture the command and allowedUsers if Command Trigger Type.  DWKit will reuse the previous Command and IdentityIds on Auto Trigger Type.
                // We don't want to report the previous Command or Identity with Auto Trigger Types.
                string command = null;
                string allowedUserNames = null;
                if (processInstance.ExecutedTransition.Trigger.Type == TriggerType.Command)
                {
                    command = WorkflowInit.Runtime.GetLocalizedCommandName(processInstance.ProcessId, processInstance.CurrentCommand);

                    var identityIds = processInstance.IdentityIds.ConvertAll(s => Guid.Parse(s)).ToList();
                    var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                    Product product = await GetProductForProcess(processInstance, productRepository);
                    var userRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<User>>();
                    var userNames = userRepository.Get()
                        .Where(u => u.WorkflowUserId != null && identityIds.Contains(u.WorkflowUserId.Value))
                        .Select(u => u.Name).ToList();
                    allowedUserNames = String.Join(',', userNames);
                }

                var productTransitionsRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<ProductTransition>>();
                var history = new ProductTransition
                {
                    ProductId = processInstance.ProcessId,
                    AllowedUserNames = allowedUserNames,
                    InitialState = currentstate,
                    DestinationState = nextState,
                    Command = command
                };

                await productTransitionsRepository.CreateAsync(history);
            }
        }

        private async Task UpdateProductTransitionAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            // Note: If admin uses "Set State" from DWKit Admin UI, the ExecutedTransition will be null

            if (string.IsNullOrEmpty(processInstance.CurrentCommand)) { return; }

            // Skip Timers -- we are choosing not to report them in the ProductTransitions
            if (processInstance.ExecutedTransition?.Trigger.Type == TriggerType.Timer) { return; }

            var currentstate = processInstance.CurrentState;
            var nextState = processInstance.ExecutedActivityState;
            var command = WorkflowInit.Runtime.GetLocalizedCommandName(processInstance.ProcessId, processInstance.CurrentCommand);
            Log.Information($"Update Product Transition Async current: {currentstate} next: {nextState}");
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                var productTransitionsRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<ProductTransition>>();
                var history = await productTransitionsRepository.Get()
                    .Where(h => h.ProductId == processInstance.ProcessId
                           && h.DateTransition == null
                           && h.InitialState == currentstate
                           && h.DestinationState == nextState).FirstOrDefaultAsync();
                if (history == null)
                {
                    history = new ProductTransition
                    {
                        ProductId = processInstance.ProcessId,
                        AllowedUserNames = String.Empty,
                        InitialState = currentstate,
                        DestinationState = nextState
                    };
                    history = await productTransitionsRepository.CreateAsync(history);
                }

                // Only capture the command or userif Command Trigger Type.  DWKit will reuse the previous Command and IdentityIds on Auto Trigger Type.
                // We don't want to report the previous Command or Identity with Auto Trigger Types.
                if (processInstance.ExecutedTransition?.Trigger.Type == TriggerType.Command)
                {
                    history.Command = command;

                    if (Guid.TryParse(processInstance.IdentityId, out Guid identityId))
                    {
                        history.WorkflowUserId = identityId;
                    }
                }
                if (!String.IsNullOrWhiteSpace(product.WorkflowComment))
                {
                    history.Comment = product.WorkflowComment;
                    await ClearComment(processInstance);
                }
                history.DateTransition = DateTime.UtcNow;
                await productTransitionsRepository.UpdateAsync(history);
            }
        }
        #endregion

        #region Implementation of IWorkflowActionProvider

        public void ExecuteAction(string name, ProcessInstance processInstance, WorkflowRuntime runtime,
            string actionParameter)
        {
            if (_actions.ContainsKey(name))
                _actions[name].Invoke(processInstance, runtime, actionParameter);
            else
                throw new NotImplementedException($"Action with name {name} isn't implemented");
        }

        public async Task ExecuteActionAsync(string name, ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            //token.ThrowIfCancellationRequested(); // You can use the transferred token at your discretion
            if (_asyncActions.ContainsKey(name))
                await _asyncActions[name].Invoke(processInstance, runtime, actionParameter, token);
            else
                throw new NotImplementedException($"Async Action with name {name} isn't implemented");
        }

        public bool ExecuteCondition(string name, ProcessInstance processInstance, WorkflowRuntime runtime,
            string actionParameter)
        {
            if (_conditions.ContainsKey(name))
                return _conditions[name].Invoke(processInstance, runtime, actionParameter);

            throw new NotImplementedException($"Condition with name {name} isn't implemented");
        }

        public async Task<bool> ExecuteConditionAsync(string name, ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            //token.ThrowIfCancellationRequested(); // You can use the transferred token at your discretion
            if (_asyncConditions.ContainsKey(name))
                return await _asyncConditions[name].Invoke(processInstance, runtime, actionParameter, token);

            throw new NotImplementedException($"Async Condition with name {name} isn't implemented");
        }

        public bool IsActionAsync(string name)
        {
            return _asyncActions.ContainsKey(name);
        }

        public bool IsConditionAsync(string name)
        {
            return _asyncConditions.ContainsKey(name);
        }

        public List<string> GetActions()
        {
            var actions = _actions.Keys.Union(_asyncActions.Keys).ToList();
            return actions;
        }

        public List<string> GetConditions()
        {
            var conditions = _conditions.Keys.Union(_asyncConditions.Keys).ToList();
                return conditions;
        }

        #endregion
    }
}
