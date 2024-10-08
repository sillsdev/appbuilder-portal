﻿using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Forms.Products;
using OptimaJet.DWKit.StarterApplication.Models;
using System.Threading.Tasks;
using JsonApiDotNetCore.Internal;
using OptimaJet.DWKit.StarterApplication.Repositories;
using System.Collections.Generic;
using static OptimaJet.DWKit.StarterApplication.Utility.ServiceExtensions;
using JsonApiDotNetCore.Internal.Query;
using Hangfire;
using OptimaJet.DWKit.StarterApplication.Services.Workflow;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class ProductService : EntityResourceService<Product, Guid>
    {
        IEntityRepository<Product, Guid> ProductRepository { get; set; }
        IEntityRepository<ProductDefinition> ProductDefinitionRepository { get; set; }
        public IEntityRepository<WorkflowDefinition> WorkflowDefinitionRepository { get; }
        IEntityRepository<Store> StoreRepository { get; }
        public IEntityRepository<UserRole> UserRolesRepository { get; }
        public IEntityRepository<ProductPublication> ProductPublicationsRepository { get; }
        public IEntityRepository<UserTask> UserTaskRepostiory { get; }
        IBackgroundJobClient HangfireClient { get; }
        UserRepository UserRepository { get; set; }
        ProjectRepository ProjectRepository { get; set; }
        ICurrentUserContext CurrentUserContext { get; set; }

        IJsonApiContext JsonApiContext { get; }
        public IOrganizationContext OrganizationContext { get; private set; }

        public ProductService(
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            IEntityRepository<Product, Guid> productRepository,
            UserRepository userRepository,
            ProjectRepository projectRepository,
            ICurrentUserContext currentUserContext,
            IEntityRepository<ProductDefinition> productDefinitionRepository,
            IEntityRepository<WorkflowDefinition> workflowDefinitionRepository,
            IEntityRepository<Store> storeRepository,
            IEntityRepository<UserRole> userRolesRepository,
            IEntityRepository<ProductPublication> productPublicationsRepository,
            IEntityRepository<UserTask> userTaskRepostiory,
            IBackgroundJobClient hangfireClient,
            ILoggerFactory loggerFactory) : base(jsonApiContext, productRepository, loggerFactory)
        {
            ProductRepository = productRepository;
            ProductDefinitionRepository = productDefinitionRepository;
            WorkflowDefinitionRepository = workflowDefinitionRepository;
            StoreRepository = storeRepository;
            UserRolesRepository = userRolesRepository;
            ProductPublicationsRepository = productPublicationsRepository;
            UserTaskRepostiory = userTaskRepostiory;
            HangfireClient = hangfireClient;
            UserRepository = userRepository;
            ProjectRepository = projectRepository;
            CurrentUserContext = currentUserContext;
            OrganizationContext = organizationContext;
            JsonApiContext = jsonApiContext;

        }

        public override async Task<IEnumerable<Product>> GetAsync()
        {
            return await GetScopedToOrganization<Product>(base.GetAsync,
                                               OrganizationContext,
                                               JsonApiContext);
        }
        public override async Task<Product> GetAsync(Guid id)
        {
            var products = await GetAsync();
            return products.SingleOrDefault(p => p.Id == id);
        }

        public override async Task<Product> UpdateAsync(Guid id, Product resource)
        {
            //If changing organization, validate the change
            var updateForm = new UpdateForm(UserRepository,
                                            ProductRepository,
                                            ProductDefinitionRepository,
                                            StoreRepository,
                                            UserRolesRepository,
                                            ProjectRepository,
                                            OrganizationContext,
                                            CurrentUserContext);
            if (!updateForm.IsValid(id, resource))
            {
                throw new JsonApiException(updateForm.Errors);
            }

            var result = await base.UpdateAsync(id, resource);

            // TODO: figure out why this throws a NullReferenceException
            // await ProjectRepository.UpdateAsync(result.ProjectId, result.Project);

            return result;
        }
        public override async Task<Product> CreateAsync(Product resource)
        {
            var createForm = new CreateForm(ProjectRepository,
                                            ProductDefinitionRepository,
                                            StoreRepository,
                                            UserRolesRepository,
                                            UserRepository,
                                            CurrentUserContext);
            if (!createForm.IsValid(resource))
            {
                throw new JsonApiException(createForm.Errors);
            }

            var product = await base.CreateAsync(resource);

            // TODO: figure out why this throws a NullReferenceException
            // await ProjectRepository.UpdateAsync(result.ProjectId, result.Project);

            if (product != null)
            {
                HangfireClient.Enqueue<WorkflowProductService>(service => service.ManageNewProduct(product.Id));
            }
            return product;
        }

        public override async Task<bool> DeleteAsync(Guid id)
        {
            var product = await GetProductForTasks(id);
            if (product != null)
            {
                // Force delete of UserTasks instead of allowing cascade delete so that notifications will be sent.
                var userTasks = product.UserTasks.ToList();
                foreach (var userTask in userTasks)
                {
                    Log.Debug($"Force Delete UserTask: product=${id}, userId={userTask.UserId}, userTaskId={userTask.Id}");
                    await this.UserTaskRepostiory.DeleteAsync(userTask.Id);
                }
                HangfireClient.Enqueue<WorkflowProductService>(service => service.ManageDeletedProduct(product.Id, product.ProjectId));
            }

            return await base.DeleteAsync(id);
        }

        public List<string> GetActionsForProduct(Product product)
        {
            User currentUser = UserRepository.CurrentUser;
            bool userIsOwner = currentUser.Id == product.Project.OwnerId;

            // Workflow is not running and has been published
            if ( (product?.ProductWorkflow == null) &&
                 (product.DatePublished.HasValue)     )
            {
                //Provide actions that are defined
                var result = new List<string>();
                if (product.ProductDefinition.RebuildWorkflowId.HasValue && userIsOwner)
                {
                    result.Add(WorkflowType.Rebuild.ToString());
                }
                if (product.ProductDefinition.RepublishWorkflowId.HasValue && userIsOwner)
                {
                    result.Add(WorkflowType.Republish.ToString());
                }

                return result;
            }

            return new List<string>();
        }

        public async Task<List<string>> GetProductActionsAsync(Guid id)
        {
            Product product = await GetProductForActions(id);

            if (product == null)
            {
                return null;
            }
            if (product.ProductWorkflow == null)
            {
                // No running workflow.  
                
                if (!product.DatePublished.HasValue)
                {
                    // Product has not been published
                    return null;
                }

                //Provide actions that are defined
                return GetActionsForProduct(product);
            }

            var wd = await GetExecutingWorkflowDefintion(product);

            if (wd == null)
            {
                return null;
            }

            User currentUser = UserRepository.CurrentUser;
            bool userIsOwner = currentUser.Id == product.Project.OwnerId;
            if (userIsOwner && (wd.Type != WorkflowType.Startup))
            {
                // Running a action workflow.  Provide cancel action
                return new List<string> { "Cancel" };
            }

            // Running the startup workflow.  Return empty list
            return new List<string>();
        }
        public async Task<IEnumerable<ProductTransition>> GetProductTransitionsForDisplayAsync(Guid id)
        {
            var product = await ProductRepository.Get()
                .Where(p => p.Id == id)
                .Include(p => p.Transitions)
                .FirstOrDefaultAsync();
            if (product == null)
            {
                return null;
            }
            else
            {
                var completedTransitions = product.Transitions
                    .Where(t => t.DateTransition != null)
                    .OrderBy(t => t.DateTransition)
                    .ToList();
                var notCompletedTransitions = product.Transitions
                    .Where(t => t.DateTransition == null)
                    .OrderBy(t => t.Id)
                    .ToList();
                return completedTransitions.Concat(notCompletedTransitions);
            }
        }
        public async Task<List<ProductTransition>> GetProductTransitionsAsync(Guid id)
        {
            var product = await ProductRepository.Get()
                .Where(p => p.Id == id)
                .Include(p => p.Transitions)
                .FirstOrDefaultAsync();
            if (product == null)
            {
                return null;
            } else
            {
                var orderedTransitions = product.Transitions.OrderBy(t => t.Id).ToList();
                return orderedTransitions;
            }
        }
        public async Task<ProductTransition> GetActiveTransitionAsync(Guid id)
        {
            var transitions = await GetProductTransitionsAsync(id);
            if (transitions == null)
            {
                return null;
            } else
            {
                var active = transitions
                    .Where(t => t.DateTransition == null)
                    .OrderBy(t => t.Id)
                    .FirstOrDefault();
                var previous = transitions
                    .Where(t => t.DateTransition != null)
                    .OrderByDescending(t => t.Id)
                    .FirstOrDefault();
                if (active != null && previous != null)
                {
                    active.DateStarted = previous.DateTransition;
                }
                return active;
            }
        }
        private async Task<WorkflowDefinition> GetExecutingWorkflowDefintion(Product product)
        {
            return await WorkflowDefinitionRepository.Get()
                .Where(w => w.WorkflowScheme == product.ProductWorkflow.Scheme.SchemeCode)
                .FirstOrDefaultAsync();
        }

        private async Task<Product> GetProductForActions(Guid id)
        {
            return await ProductRepository.Get()
                .Where(p => p.Id == id)
                .Include(p => p.ProductWorkflow)
                    .ThenInclude(pw => pw.Scheme)
                .Include(p => p.ProductDefinition)
                .Include(p => p.Project)
                .FirstOrDefaultAsync();
        }

        private async Task<Product> GetProductForTasks(Guid id)
        {
            return await ProductRepository.Get()
                .Where(p => p.Id == id)
                .Include(p => p.UserTasks)
                .FirstOrDefaultAsync();
        }

        public async Task<WorkflowDefinition> RunActionForProductAsync(Guid id, string type)
        {
            User currentUser = UserRepository.CurrentUser;
            var product = await GetProductForActions(id);
            if (product == null)
            {
                return null;
            }

            if (currentUser.Id != product.Project.OwnerId)
            {
                throw new Exception("Unable to run action.  Current user is not the project owner");
            }

            if (product.ProductWorkflow == null)
            {
                // No running workflow.  Start one.
                int? workflowDefinitionId = GetWorkflowDefinitionIdForType(product, type);

                if (workflowDefinitionId.HasValue)
                {
                    HangfireClient.Enqueue<WorkflowProductService>(service => service.StartProductWorkflow(id, workflowDefinitionId.Value));
                    return await WorkflowDefinitionRepository.GetAsync(workflowDefinitionId.Value);
                }

                throw new Exception($"Type '{type}' does not have workflow defined");
            }

            // Handle special case for "Cancel" action
            if (type == "Cancel")
            {
                var wd = await GetExecutingWorkflowDefintion(product);
                if (wd == null)
                {
                    throw new Exception("Could not find workflow definition!");
                }

                if (wd.Type == WorkflowType.Startup)
                {
                    throw new Exception("Cannot cancel a startup workflow");
                }

                HangfireClient.Enqueue<WorkflowProductService>(service => service.StopProductWorkflow(id, product.ProjectId, ProductTransitionType.CancelWorkflow));
                return wd;
            }

            // Trying to start an action workflow while one is already running
            throw new Exception("Cannot start a workflow while one is running");
        }

        private int? GetWorkflowDefinitionIdForType(Product product,string type)
        {
            int? workflowDefinitionId = null;

            if (product.ProductWorkflow == null)
            {
                if (type == WorkflowType.Rebuild.ToString())
                {
                    workflowDefinitionId = product.ProductDefinition.RebuildWorkflowId;
                }
                else if (type == WorkflowType.Republish.ToString())
                {
                    workflowDefinitionId = product.ProductDefinition.RepublishWorkflowId;
                }
                else
                {
                    throw new Exception($"Invalid type '{type}'");
                }
            }

            return workflowDefinitionId;
        }

        public class ProductWorkflowDefinition
        {
            public Guid Id { get; set; }
            public int WorkflowDefinitionId { get; set; }
        }

        public bool ProductCanRunAction(int? id, Product product, string type, int currentUserId)
        {
            if (!id.HasValue)
            {
                throw new JsonApiException(403, $"Product {product.ProductDefinition.Name} cannot run action {type}: no workflow defined");
            }
            if (product.DatePublished == null)
            {
                throw new JsonApiException(403, $"Product {product.ProductDefinition.Name} cannot run action {type}: not published");
            }
            if (product.Project.OwnerId != currentUserId)
            {
                throw new JsonApiException(403, $"Product {product.ProductDefinition.Name} cannot run action {type}: current user is not project owner");
            }
            return true;
        }

        public async Task RunActionForProductsAsync(IEnumerable<Guid> ids, string type)
        {
            User currentUser = UserRepository.CurrentUser;
            var products = await ProductRepository.Get()
                .Where(p => ids.Contains(p.Id))
                .Include(p => p.ProductWorkflow)
                    .ThenInclude(pw => pw.Scheme)
                .Include(p => p.Project)
                    .ThenInclude(pr => pr.Owner)
                .Include(p => p.ProductDefinition).ToListAsync();

            var productWorflowDefinitions = (from product in products
                    let workflowDefinitionId = GetWorkflowDefinitionIdForType(product, type)
                    where ProductCanRunAction(workflowDefinitionId, product, type, currentUser.Id)
                    select new ProductWorkflowDefinition { Id = product.Id, WorkflowDefinitionId = workflowDefinitionId.Value }).ToList();

            foreach (var pwd in productWorflowDefinitions)
            {
                HangfireClient.Enqueue<WorkflowProductService>(service => service.StartProductWorkflow(pwd.Id, pwd.WorkflowDefinitionId));
            }
        }

        /// <summary>
        /// Get the ProductActions of projects that are eligible to be executed
        /// </summary>
        /// <returns>The ProductActions.</returns>
        /// <param name="ids">Project Ids</param>

        public async Task<IEnumerable<ProductActions>> GetProductActionsForProjectsAsync(IEnumerable<int> ids)
        {
            var products = await ProductRepository.Get()
                .Where(p => ids.Contains(p.ProjectId))
                .Include(p => p.ProductDefinition)
                .Include(p => p.Project)
                .Include(p => p.ProductWorkflow).ToListAsync();

            var productActions = (
                    from product in products
                    let actions = GetActionsForProduct(product)
                    where actions.Any()
                    select new ProductActions { Id = product.Id, Actions = actions }).ToList();

            return productActions;
        }

        /// <summary>
        /// Get the most recent published file of specified type associated with this product
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <param name="type">ProductArtifact type to be returned</param>
        /// <returns></returns>
        public async Task<ProductArtifact> GetPublishedFile(Guid id, String type)
        {
            var publications = await ProductPublicationsRepository.Get()
                .Where(pp => pp.ProductId == id && pp.Success == true)
                .Include(pp => pp.ProductBuild)
                    .ThenInclude(pb => pb.ProductArtifacts)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
            foreach(var publication in publications)
            {
                if (publication == null || publication.ProductBuild.ProductArtifacts == null)
                {
                    continue;
                }
                var artifact = publication.ProductBuild.ProductArtifacts
                    .Where(pa => pa.ArtifactType == type)
                    .FirstOrDefault();

                if (artifact != null)
                {
                    return artifact;
                }
            }

            // Return null if product has not been successfully published
            return null;
        }

        public async Task<ProductArtifact> GetPublishedAppDetails(String package)
        {
            var publications = await ProductPublicationsRepository.Get()
                .Where(pp => pp.Package == package && pp.Success == true)
                .Include(pp => pp.ProductBuild)
                    .ThenInclude(pb => pb.ProductArtifacts)
                .OrderByDescending(p => p.Id)
                .ToListAsync();

            foreach (var publication in publications)
            {
                if (publication == null || publication.ProductBuild.ProductArtifacts == null)
                {
                    continue;
                }
                var artifact = publication.ProductBuild.ProductArtifacts
                    .Where(pa => pa.ArtifactType == "play-listing-manifest")
                    .FirstOrDefault();

                if (artifact != null)
                {
                    return artifact;
                }
            }

            return null;
        }
    }
}
