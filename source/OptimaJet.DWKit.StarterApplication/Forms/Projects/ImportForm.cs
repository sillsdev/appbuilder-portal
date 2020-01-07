using System;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using static OptimaJet.DWKit.StarterApplication.Utility.IEnumerableExtensions;

namespace OptimaJet.DWKit.StarterApplication.Forms.Projects
{
    public class ImportForm : BaseProjectForm
    {
        public UserRepository UserRepository { get; set; }
        public GroupRepository GroupRepository { get; set; }
        public IEntityRepository<Organization> OrganizationRepository { get; set; }
        public IEntityRepository<ProductDefinition> ProductDefinitionRepository { get; }
        public IEntityRepository<Store> StoreRepository { get; }
        public ICurrentUserContext CurrentUserContext { get; }

        public ImportForm(
            UserRepository userRepository,
            GroupRepository groupRepository,
            ICurrentUserContext currentUserContext,
            IEntityRepository<UserRole> userRolesRepository,
            IEntityRepository<Organization> organizationRepository,
            IEntityRepository<ProductDefinition> productDefinitionRepository,
            IEntityRepository<Store> storeRepository)
            : base(userRepository, userRolesRepository, currentUserContext)
        {
            UserRepository = userRepository;
            GroupRepository = groupRepository;
            OrganizationRepository = organizationRepository;
            ProductDefinitionRepository = productDefinitionRepository;
            StoreRepository = storeRepository;
            CurrentUserContext = currentUserContext;
        }

        public async Task<bool> IsValid(ProjectImport projectImport)
        {
            // Project and ProjectImport have the same base properties for Organization,
            // Owner, and Group.  So we can reuse those checks.

            // If these fields aren't filled in, then let the foreign key failure 
            // be reported
            if ((projectImport.OrganizationId != VALUE_NOT_SET)
                && (projectImport.OwnerId != VALUE_NOT_SET)
                && (projectImport.GroupId != VALUE_NOT_SET))
            {
                Organization = await OrganizationRepository.Get()
                        .Where(o => o.Id == projectImport.OrganizationId)
                        .Include(o => o.OrganizationProductDefinitions)
                        .Include(o => o.OrganizationStores)
                        .FirstOrDefaultAsync();
                Group = await GroupRepository.Get()
                       .Where(g => g.Id == projectImport.GroupId)
                       .Include(g => g.Owner).FirstOrDefaultAsync();
                ProjectOwner = await UserRepository.Get()
                        .Where(u => u.Id == projectImport.OwnerId)
                        .Include(u => u.OrganizationMemberships)
                            .ThenInclude(om => om.Organization)
                        .FirstOrDefaultAsync();
                CurrentUserOrgIds = CurrentUser.OrganizationIds.OrEmpty();
                base.ValidateProject();
            }

            if (base.IsValid())
            {
                // Verify the Products
                var importData = JsonConvert.DeserializeObject<ImportData>(projectImport.ImportData);
                foreach (var importProduct in importData.Products)
                {
                    var productDefinition = await ProductDefinitionRepository.Get()
                        .Where(pd => pd.Name == importProduct.Name)
                        .Include(pd => pd.Workflow)
                        .FirstOrDefaultAsync();

                    if (productDefinition == null)
                    {
                        var message = $"The product.Name={importProduct.Name} was not found";
                        AddError(message);
                    }
                    else if (!Organization.ProductDefinitionIds.Contains(productDefinition.Id))
                    {
                        var message = $"The product.Name={importProduct.Name} is not allowed for organization.Name={Organization.Name}";
                        AddError(message);
                    }

                    var store = await StoreRepository.Get()
                        .Where(s => s.Name == importProduct.Store)
                        .Include(s => s.StoreType)
                            .ThenInclude(st => st.Languages)
                        .FirstOrDefaultAsync();
                    if (store == null)
                    {
                        var message = $"The product.Store={importProduct.Store} was not found";
                        AddError(message);
                    }
                    else
                    {
                        if (!Organization.StoreIds.Contains(store.Id))
                        {
                            var message = $"The product.Store={importProduct.Store} is not allowed for organization.Name={Organization.Name}";
                            AddError(message);
                        }

                        if (store.StoreTypeId != productDefinition.Workflow.StoreTypeId)
                        {
                            var message = "The store type values do not match for this product";
                            AddError(message);
                        }

                        // Not validating Product.StoreLanguageId since it will be coming
                        // from the project's default-language and should be validated in SAB??
                    }

                }
            }

            return base.IsValid();
        }
    }
}
