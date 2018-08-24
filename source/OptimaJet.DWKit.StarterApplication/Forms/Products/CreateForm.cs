using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using Microsoft.EntityFrameworkCore;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace OptimaJet.DWKit.StarterApplication.Forms.Products
{
    public class CreateForm : BaseProductForm
    {
        ProjectRepository ProjectRepository;
        IEntityRepository<ProductDefinition> ProductDefinitionRepository;
        public CreateForm(
            ProjectRepository projectRepository,
            IEntityRepository<ProductDefinition> productDefinitionRepository,
            UserRepository userRepository,
            ICurrentUserContext currentUserContext
        ) : base(userRepository, currentUserContext)
        {
            ProjectRepository = projectRepository;
            ProductDefinitionRepository = productDefinitionRepository;
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
                  .FirstOrDefaultAsync().Result;
                var productDefinition = ProductDefinitionRepository.Get()
                  .Where(pd => pd.Id == product.ProductDefinitionId)
                  .FirstOrDefaultAsync().Result;
                CurrentUserOrgIds = CurrentUser.OrganizationIds.OrEmpty();
                ValidateProduct(project, productDefinition);
            }
            return base.IsValid();
        }
    }
}
