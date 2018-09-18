using System;
using System.Collections.Generic;
using System.Linq;
using JsonApiDotNetCore.Internal;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Forms
{
    public class BaseForm
    {
        public static int VALUE_NOT_SET = 0;
        public ErrorCollection Errors { get; set; }
        public User CurrentUser { get; }
        protected IEnumerable<int> CurrentUserOrgIds { get; set; }
        public IOrganizationContext OrganizationContext { get; set; }
        public BaseForm(
            UserRepository userRepository,
            ICurrentUserContext currentUserContext)
        {
            Errors = new ErrorCollection();
            CurrentUser = userRepository.GetByAuth0Id(currentUserContext.Auth0Id).Result;
        }

        public void AddError(string message, int errorType = 422)
        {
            var error = new Error(errorType, "Validation Failure", message);

            Errors.Add(error);
        }
        protected bool IsValid()
        {
            return Errors.Errors.Count == 0;
        }
        protected void ValidateOrganizationHeader(int initialOrganizationId, string objectType)
        {
            if (OrganizationContext.SpecifiedOrganizationDoesNotExist)
            {
                var message = "The organization specified in the header does not exist";
                AddError(message);
            }
            else
            {
                // Treating these errors as Not Found errors
                if (OrganizationContext.HasOrganization)
                {
                    if (initialOrganizationId != OrganizationContext.OrganizationId)
                    {
                        var message = $"The current {objectType} doesn't belong to the organization specified in the header";
                        AddError(message, 404);
                    }
                }
                if (!CurrentUserOrgIds.Contains(initialOrganizationId))
                {
                    var message = $"The current user is not a member of the {objectType} organization";
                    AddError(message, 404);
                }
            }
        }

    }
}
