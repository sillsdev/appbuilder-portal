using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

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
            IEntityRepository<UserRole> userRolesRepository,
            ICurrentUserContext currentUserContext) : base(userRepository, userRolesRepository, currentUserContext)
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
            if ((!CurrentUserOrgIds.Contains(Organization.Id)) && (!IsCurrentUserSuperAdmin()))
            {
                var message = ("The current user is not a member of the project organization");
                AddError(message);
            }
            if (ProjectOwner.PublishingKey == null)
            {
                var message = ("The project owner's publishing key is not set");
                AddError(message);
            }
            else if (!ValidPublishingKey(ProjectOwner.PublishingKey))
            {
                var message = ("The project owner's publishing key is not valid");
                AddError(message);
            }
        }
    }
}
