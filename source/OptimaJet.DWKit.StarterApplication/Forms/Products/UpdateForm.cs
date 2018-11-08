using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace OptimaJet.DWKit.StarterApplication.Forms.Products
{
    public class UpdateForm : BaseProductForm
    {
        IEntityRepository<Product, Guid> ProductRepository;
        ProjectRepository ProjectRepository;
        IEntityRepository<ProductDefinition> ProductDefinitionRepository;
        IEntityRepository<Store> StoreRepository;
        public UpdateForm(UserRepository userRepository,
                          IEntityRepository<Product, Guid> productRepository,
            IEntityRepository<ProductDefinition> productDefinitionRepository,
            IEntityRepository<Store> storeRepository,
            ProjectRepository projectRepository,
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext) : base(userRepository, currentUserContext)
        {
            ProductRepository = productRepository;
            ProjectRepository = projectRepository;
            ProductDefinitionRepository = productDefinitionRepository;
            StoreRepository = storeRepository;
            OrganizationContext = organizationContext;
        }


        public bool IsValid(Guid id, Product product)
        {
            CurrentUserOrgIds = CurrentUser.OrganizationIds.OrEmpty();
            var original = ProductRepository.Get()
                  .Where(p => p.Id == id)
                  .Include(p => p.ProductDefinition)
                        .ThenInclude(pd => pd.Workflow)
                  .Include(p => p.Project)
                        .ThenInclude(pr => pr.Organization)
                             .ThenInclude(or => or.OrganizationProductDefinitions)
                                   .ThenInclude(opd => opd.ProductDefinition)
                  .Include(p => p.Project)
                        .ThenInclude(pr => pr.Organization)
                            .ThenInclude(or => or.OrganizationStores)
                  .FirstOrDefaultAsync().Result;
            ValidateOrganizationHeader(original.Project.OrganizationId, "product");
            var updatedProject = original.Project;
            var updatedProductDefinition = original.ProductDefinition;
            var updatedStoreLanguageId = original.StoreLanguageId;
            Store updatedStore = null;
            // The following query must be done separately from the first query
            // because Store may not be set and if it isn't and this is done as
            // an include then the whole query fails
            if (original.StoreId != VALUE_NOT_SET)
            {
                updatedStore = StoreRepository.Get()
                  .Where(s => s.Id == original.StoreId)
                  .Include(s => s.StoreType)
                    .ThenInclude(st => st.Languages)
                  .FirstOrDefaultAsync().Result;
            }
            if (product.ProjectId != VALUE_NOT_SET)
            {
                // Project is being updated
                updatedProject = ProjectRepository.Get()
                  .Where(p => p.Id == product.ProjectId)
                  .Include(pr => pr.Organization)
                     .ThenInclude(or => or.OrganizationProductDefinitions)
                           .ThenInclude(opd => opd.ProductDefinition)
                  .Include(pr => pr.Organization)
                      .ThenInclude(or => or.OrganizationStores)
                  .FirstOrDefaultAsync().Result;

            }
            if (product.ProductDefinitionId != VALUE_NOT_SET)
            {
                // Product definition is being updated
                updatedProductDefinition = ProductDefinitionRepository.Get()
                  .Where(pd => pd.Id == product.ProductDefinitionId)
                  .Include(pd => pd.Workflow)
                  .FirstOrDefaultAsync().Result;
            }
            if (product.StoreId != VALUE_NOT_SET)
            {
                updatedStore = StoreRepository.Get()
                  .Where(s => s.Id == product.StoreId)
                  .Include(s => s.StoreType)
                    .ThenInclude(st => st.Languages)
                  .FirstOrDefaultAsync().Result;
            }
            if (product.StoreLanguageId != VALUE_NOT_SET)
            {
                updatedStoreLanguageId = product.StoreLanguageId;
            }
            ValidateProduct(updatedProject, updatedProductDefinition, updatedStore, updatedStoreLanguageId);
            return base.IsValid();
        }
    }
}