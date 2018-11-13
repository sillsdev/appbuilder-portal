using System;
using System.Collections.Generic;
using System.Linq;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;
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

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
	public class WorkflowProductActionProvider : IWorkflowActionProvider
    {
        private readonly Dictionary<string, Action<ProcessInstance, WorkflowRuntime, string>> _actions = new Dictionary<string, Action<ProcessInstance, WorkflowRuntime, string>>();

        private readonly Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task>> _asyncActions =
            new Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task>>();

        private readonly Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, bool>> _conditions =
            new Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, bool>>();

        private readonly Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task<bool>>> _asyncConditions =
            new Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task<bool>>>();

        public IServiceProvider ServiceProvider { get; }

        public WorkflowProductActionProvider(IServiceProvider serviceProvider)
        {
            ServiceProvider = serviceProvider;

            //Register your actions in _actions and _asyncActions dictionaries
            //_asyncActions.Add("WriteTransitionHistory", WriteTransitionHistoryAsync);
            //_asyncActions.Add("UpdateTransitionHistory", UpdateTransitionHistoryAsync);
            _asyncActions.Add("SendOwnerNotification", SendOwnerNotificationAsync);
            _asyncActions.Add("BuildEngine_CreateProduct", BuildEngineCreateProductAsync);

            //Register your conditions in _conditions and _asyncConditions dictionaries
            //_asyncConditions.Add("CheckBigBossMustSign", CheckBigBossMustSignAsync); 
            _asyncConditions.Add("BuildEngine_ProductCreated", BuildEngineProductCreated);
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

        private async Task BuildEngineCreateProductAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            using (var scope = ServiceProvider.CreateScope())
            {
                var productRepository = scope.ServiceProvider.GetRequiredService<IJobRepository<Product, Guid>>();
                Product product = await GetProductForProcess(processInstance, productRepository);
                if (product.WorkflowJobId == 0) 
                {
                    BuildEngineProductService.CreateBuildEngineProduct(product.Id);
                    Log.Information($"BuildEngineCreateProduct: productId={product.Id}, projectName={product.Project.Name}");
                }
            }
        }

        private static async Task<Product> GetProductForProcess(ProcessInstance processInstance, IJobRepository<Product, Guid> productRepository)
        {
            return await productRepository.Get()
                .Where(p => p.Id == processInstance.ProcessId)
                .Include(p => p.Project)
                    .ThenInclude(p => p.Owner)
                .FirstOrDefaultAsync();
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
            return _actions.Keys.Union(_asyncActions.Keys).ToList();
        }

        public List<string> GetConditions()
        {
            return _conditions.Keys.Union(_asyncConditions.Keys).ToList();
        }

        #endregion
    }
}
