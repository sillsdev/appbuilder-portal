using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Forms.Products
{
    public class BaseProductForm : BaseForm
    {
        public BaseProductForm(
            UserRepository userRepository,
            IEntityRepository<UserRole> userRolesRepository,
            ICurrentUserContext currentUserContext) : base(userRepository, userRolesRepository ,currentUserContext)
        {
        }
        protected void ValidateProduct(Project project, ProductDefinition productDefinition, Store store, int? storeLanguageId)
        {
            if ((project == null) || (productDefinition == null))
            {
                // Allowing it to return in these cases should cause the base to hit normal
                // foreign key failures
                return;
            }
            if (store != null)
            {
                if (!(store.StoreTypeId == productDefinition.Workflow.StoreTypeId))
                {
                    var message = "The store type values do not match for this product";
                    AddError(message);
                }
                if (!project.Organization.StoreIds.Contains(store.Id))
                {
                    var message = "This store is not permitted for this product";
                    AddError(message);
                }
                else if (storeLanguageId.HasValue && !store.StoreType.LanguageIds.Contains(storeLanguageId.Value))
                {
                    var message = "Invalid store language for this product";
                    AddError(message);
                }
            }

            if (!project.Organization.ProductDefinitionIds.Contains(productDefinition.Id))
            {
                var message = $"This product is not permitted for the organization";
                AddError(message);
            }
            if (project.WorkflowProjectUrl == null)
            {
                var message = $"There is no workflow project url for this product";
                AddError(message);
            }
            // The current user should be a member of the organization
            if ((!CurrentUserOrgIds.Contains(project.Organization.Id)) && (!IsCurrentUserSuperAdmin()))
            {
                var message = ("The current user is not a member of the organization");
                AddError(message);
            }

        }
    }
}
