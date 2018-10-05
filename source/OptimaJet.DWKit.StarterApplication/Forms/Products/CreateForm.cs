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
    public class CreateForm : BaseProductForm
    {
        ProjectRepository ProjectRepository;
        IEntityRepository<ProductDefinition> ProductDefinitionRepository;
        IEntityRepository<Store> StoreRepository { get; }
        public CreateForm(
            ProjectRepository projectRepository,
            IEntityRepository<ProductDefinition> productDefinitionRepository,
            IEntityRepository<Store> storeRepository,
            UserRepository userRepository,
            ICurrentUserContext currentUserContext
        ) : base(userRepository, currentUserContext)
        {
            ProjectRepository = projectRepository;
            ProductDefinitionRepository = productDefinitionRepository;
            StoreRepository = storeRepository;
        }


        public bool IsValid(Product product)
        {
            // If these fields aren't filled in, then let the foreign key failure 
            // be reported
            if ((product.ProductDefinitionId != VALUE_NOT_SET)
                && (product.ProjectId != VALUE_NOT_SET))
            {
                var project = ProjectRepository.Get()
                  .Where(p => p.Id == product.ProjectId)
                  .Include(pr => pr.Organization)
                     .ThenInclude(or => or.OrganizationProductDefinitions)
                           .ThenInclude(opd => opd.ProductDefinition)
                  .Include(pr => pr.Organization)
                      .ThenInclude(or => or.OrganizationStores)
                  .FirstOrDefaultAsync().Result;
                var productDefinition = ProductDefinitionRepository.Get()
                  .Where(pd => pd.Id == product.ProductDefinitionId)
                  .Include(pd => pd.Workflow)
                  .FirstOrDefaultAsync().Result;
                Store store = null;
                if (product.StoreId != VALUE_NOT_SET)
                {
                    store = StoreRepository.Get()
                      .Where(s => s.Id == product.StoreId)
                      .Include(s => s.StoreType)
                        .ThenInclude(st => st.Languages)
                      .FirstOrDefaultAsync().Result;
                }

                CurrentUserOrgIds = CurrentUser.OrganizationIds.OrEmpty();
                ValidateProduct(project, productDefinition, store, product.StoreLanguageId);
            }
            return base.IsValid();
        }
    }
}
