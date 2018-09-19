using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using static OptimaJet.DWKit.StarterApplication.Utility.IEnumerableExtensions;

namespace OptimaJet.DWKit.StarterApplication.Forms.Projects
{
    public class CreateForm : BaseProjectForm
    {
        public UserRepository UserRepository { get; set; }
        public GroupRepository GroupRepository { get; set; }
        public IEntityRepository<Organization> OrganizationRepository { get; set; }
        public ICurrentUserContext CurrentUserContext { get; }
 
        public CreateForm(
            UserRepository userRepository,
            GroupRepository groupRepository,
            ICurrentUserContext currentUserContext,
            IEntityRepository<Organization> organizationRepository)
            : base(userRepository, currentUserContext)
        {
            UserRepository = userRepository;
            GroupRepository = groupRepository;
            OrganizationRepository = organizationRepository;
            CurrentUserContext = currentUserContext;
        }

        public bool IsValid(Project project)
        {
            // If these fields aren't filled in, then let the foreign key failure 
            // be reported
            if ((project.OrganizationId != VALUE_NOT_SET)
                && (project.OwnerId != VALUE_NOT_SET)
                && (project.GroupId != VALUE_NOT_SET))
            {
                Organization = OrganizationRepository.Get()
                        .Where(o => o.Id == project.OrganizationId)
                        .FirstOrDefaultAsync().Result;
                Group = GroupRepository.Get()
                       .Where(g => g.Id == project.GroupId)
                       .Include(g => g.Owner).FirstOrDefaultAsync().Result;
                ProjectOwner = UserRepository.Get()
                        .Where(u => u.Id == project.OwnerId)
                        .Include(u => u.OrganizationMemberships)
                            .ThenInclude(om => om.Organization)
                        .FirstOrDefaultAsync().Result;
                CurrentUserOrgIds = CurrentUser.OrganizationIds.OrEmpty();
                base.ValidateProject();
            }
            return base.IsValid();
        }
    }
}
