using System;
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

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class ProductService : EntityResourceService<Product, Guid>
    {
        IEntityRepository<Product, Guid> ProductRepository { get; set; }
        IEntityRepository<ProductDefinition> ProductDefinitionRepository { get; set; }
        IEntityRepository<Store> StoreRepository { get; }
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
            IEntityRepository<Store> storeRepository,
            IBackgroundJobClient hangfireClient,
            ILoggerFactory loggerFactory) : base(jsonApiContext, productRepository, loggerFactory)
        {
            ProductRepository = productRepository;
            ProductDefinitionRepository = productDefinitionRepository;
            StoreRepository = storeRepository;
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
            var products = await GetAsync();
            var product = products.SingleOrDefault(p => p.Id == id);
            if (product != null)
            {
                HangfireClient.Enqueue<WorkflowProductService>(service => service.ManageDeletedProduct(product.Id));
            }

            return await base.DeleteAsync(id);
        }
    }
}
