using System;
using System.Linq;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Forms.Products
{
    public class BaseProductForm : BaseForm
    {
        public BaseProductForm(
            UserRepository userRepository,
            ICurrentUserContext currentUserContext) : base(userRepository, currentUserContext)
        {
        }
        protected void ValidateProduct(Project project, ProductDefinition productDefinition)
        {
            if ((project == null) || (productDefinition == null))
            {
                // Allowing it to return in these cases should cause the base to hit normal
                // foreign key failures
                return;
            }
            if ((project.Organization == null))
            {
                var message = $"The project for this product does not have a valid organization";
                AddError(message);
                return; // Can't proceed further without causing exceptions
            }

            if (!project.Organization.ProductDefinitionIds.Contains(productDefinition.Id))
            {
                var message = $"This product is not defined for the product's project organization";
                AddError(message);
            }
            // The current user should be a member of the organization
            if (!CurrentUserOrgIds.Contains(project.Organization.Id))
            {
                var message = ("The current user is not a member of the product organization");
                AddError(message);
            }

        }
    }
}
