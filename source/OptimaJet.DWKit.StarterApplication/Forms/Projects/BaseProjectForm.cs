using System;
using System.Collections.Generic;
using System.Linq;
using JsonApiDotNetCore.Internal;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using static OptimaJet.DWKit.StarterApplication.Utility.IEnumerableExtensions;

namespace OptimaJet.DWKit.StarterApplication.Forms.Projects
{
    public class BaseProjectForm : BaseForm
    {
        protected Organization Organization { get; set; }
        protected Group Group { get; set; }
        protected User ProjectOwner { get; set; }
        protected int InitialOrganizationId { get; set; }
        public BaseProjectForm(
            UserRepository userRepository,
            ICurrentUserContext currentUserContext) : base(userRepository, currentUserContext)
        {
        }

        protected void ValidateProject()
        {
            if ((Organization == null) || (Group == null) || (ProjectOwner == null))
            {
                // Allowing it to return in these cases should cause the base to hit normal
                // foreign key failures
                return;
            }
            if (Organization != Group.Owner)
            {
                var message = "The group associated with this project is not owned by the project organization";
                AddError(message);
            }
            if ((ProjectOwner.OrganizationIds == null) || (!ProjectOwner.OrganizationIds.Contains(Organization.Id)))
            {
                var message = "The project owner is not a member of the project organization";
                AddError(message);
            }
            // The current user should be a member of the organization
            if (!CurrentUserOrgIds.Contains(Organization.Id))
            {
                var message = ("The current user is not a member of the project organization");
                AddError(message);
            }
        }
    }
}
