using System;
using JsonApiDotNetCore.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Forms.Users
{
    public class BaseUserForm : BaseForm
    {
        protected string PublishingKey { get; set; }
        public BaseUserForm(
            UserRepository userRepository,
            IEntityRepository<UserRole> userRolesRepository,
            ICurrentUserContext currentUserContext) : base(userRepository, userRolesRepository, currentUserContext)

        {
        }
        protected void ValidateUser()
        {
            // Not required to have publishing key at this point,
            // but if it is there, it must be valid
            if (!String.IsNullOrEmpty(PublishingKey))
            {
                if (!ValidPublishingKey(PublishingKey))
                {
                    var message = ("The user's publishing key is not valid");
                    AddError(message);
                }
            }
        }
    }
}
