using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Forms.Products;
using Optimajet.DWKit.StarterApplication.Models;
using System.Threading.Tasks;
using JsonApiDotNetCore.Internal;
using OptimaJet.DWKit.StarterApplication.Repositories;
using System.Collections.Generic;
using static OptimaJet.DWKit.StarterApplication.Utility.ServiceExtensions;
using JsonApiDotNetCore.Internal.Query;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class ProductService : EntityResourceService<Product>
    {
        IEntityRepository<Product> ProductRepository { get; set; }
        IEntityRepository<ProductDefinition> ProductDefinitionRepository { get; set; }
        UserRepository UserRepository { get; set; }
        ProjectRepository ProjectRepository { get; set; }
        ICurrentUserContext CurrentUserContext { get; set; }
        IJsonApiContext JsonApiContext { get; }
        public IOrganizationContext OrganizationContext { get; private set; }

        public ProductService(
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            IEntityRepository<Product> productRepository,
            UserRepository userRepository,
            ProjectRepository projectRepository,
            ICurrentUserContext currentUserContext,
            IEntityRepository<ProductDefinition> productDefinitionRepository,
            ILoggerFactory loggerFactory) : base(jsonApiContext, productRepository, loggerFactory)

        {
            ProductRepository = productRepository;
            ProductDefinitionRepository = productDefinitionRepository;
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
        public override async Task<Product> GetAsync(int id)
        {
            var products = await GetAsync();
            return products.SingleOrDefault(p => p.Id == id);
        }

        public override async Task<Product> UpdateAsync(int id, Product resource)
        {
            //If changing organization, validate the change
            var updateForm = new UpdateForm(UserRepository,
                                            ProductRepository,
                                            ProductDefinitionRepository,
                                            ProjectRepository,
                                            OrganizationContext,
                                            CurrentUserContext);
            if (!updateForm.IsValid(id, resource))
            {
                throw new JsonApiException(updateForm.Errors);
            }
            return await base.UpdateAsync(id, resource);
        }
        public override async Task<Product> CreateAsync(Product resource)
        {
            var createForm = new CreateForm(ProjectRepository,
                                            ProductDefinitionRepository,
                                            UserRepository,
                                            CurrentUserContext);
            if (!createForm.IsValid(resource))
            {
                throw new JsonApiException(createForm.Errors);
            }
            return await base.CreateAsync(resource);
        }

    }
}
