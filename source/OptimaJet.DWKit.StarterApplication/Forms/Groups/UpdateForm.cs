using System;
using System.Collections.Generic;
using System.Linq;
using JsonApiDotNetCore.Internal;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using static OptimaJet.DWKit.StarterApplication.Utility.IEnumerableExtensions;

namespace OptimaJet.DWKit.StarterApplication.Forms.Groups
{
    public class UpdateForm : BaseForm
    {
        public UserRepository UserRepository { get; set; }
        public GroupRepository GroupRepository { get; set; }
        public ICurrentUserContext CurrentUserContext { get; }
        public UpdateForm(
            UserRepository userRepository,
            GroupRepository groupRepository,
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext): base(userRepository, currentUserContext)
        {
            UserRepository = userRepository;
            GroupRepository = groupRepository;
            OrganizationContext = organizationContext;
            CurrentUserContext = currentUserContext;
        }
        public bool IsValid(int id, Group group)
        {
            //If changing owner (which is an organization), validate the change
            CurrentUserOrgIds = CurrentUser.OrganizationIds.OrEmpty();
            var original = GroupRepository.Get()
                                          .Where(g => g.Id == id)
                                          .Include(g => g.Owner)
                                          .FirstOrDefaultAsync().Result;
            ValidateOrganizationHeader(original.OwnerId, "group");
            if (group.OwnerId != VALUE_NOT_SET)
            {
                if (!CurrentUserOrgIds.Contains(group.OwnerId))
                {
                    var message = "You do not belong to an organization that the group is owned by and therefor cannot reassign ownership";
                    AddError(message);
                }
            }

            return base.IsValid();
        }
    }
}
