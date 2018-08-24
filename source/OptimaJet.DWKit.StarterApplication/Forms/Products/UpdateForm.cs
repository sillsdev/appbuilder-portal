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
    public class UpdateForm : BaseProductForm
    {
        IEntityRepository<Product> ProductRepository;
        ProjectRepository ProjectRepository;
        IEntityRepository<ProductDefinition> ProductDefinitionRepository;
        public UpdateForm(UserRepository userRepository,
            IEntityRepository<Product> productRepository,
            IEntityRepository<ProductDefinition> productDefinitionRepository,
            ProjectRepository projectRepository,
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext) : base(userRepository, currentUserContext)
        {
            ProductRepository = productRepository;
            ProjectRepository = projectRepository;
            ProductDefinitionRepository = productDefinitionRepository;
            OrganizationContext = organizationContext;
        }
        public bool IsValid(int id, Product product)
        {
            CurrentUserOrgIds = CurrentUser.OrganizationIds.OrEmpty();
            var original = ProductRepository.Get()
                  .Where(p => p.Id == id)
                  .Include(p => p.ProductDefinition)
                  .Include(p => p.Project)
                         .ThenInclude(pr => pr.Organization)
                             .ThenInclude(or => or.OrganizationProductDefinitions)
                                   .ThenInclude(opd => opd.ProductDefinition)
                  .FirstOrDefaultAsync().Result;
            ValidateOrganizationHeader(original.Project.OrganizationId, "product");
            var updatedProject = original.Project;
            var updatedProductDefinition = original.ProductDefinition;
            if (product.ProjectId != VALUE_NOT_SET)
            {
                // Project is being updated
                updatedProject = ProjectRepository.Get()
                  .Where(p => p.Id == product.ProjectId)
                  .Include(pr => pr.Organization)
                     .ThenInclude(or => or.OrganizationProductDefinitions)
                           .ThenInclude(opd => opd.ProductDefinition)
                  .FirstOrDefaultAsync().Result;

            }
            if (product.ProductDefinitionId != VALUE_NOT_SET)
            {
                // Product definition is being updated
                updatedProductDefinition = ProductDefinitionRepository.Get()
                  .Where(pd => pd.Id == product.ProductDefinitionId)
                  .FirstOrDefaultAsync().Result;
            }
            ValidateProduct(updatedProject, updatedProductDefinition);
            return base.IsValid();
        }
    }
}