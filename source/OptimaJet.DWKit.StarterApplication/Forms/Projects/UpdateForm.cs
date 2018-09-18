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
    public class UpdateForm : BaseProjectForm
    {
        public UserRepository UserRepository { get; set; }
        public GroupRepository GroupRepository { get; set; }
        public IEntityRepository<Organization> OrganizationRepository { get; set; }
        public ICurrentUserContext CurrentUserContext { get; }
        public ProjectRepository ProjectRepository { get; set; }
        public UpdateForm(
            UserRepository userRepository,
            GroupRepository groupRepository,
            ICurrentUserContext currentUserContext,
            IEntityRepository<Organization> organizationRepository,
            IOrganizationContext organizationContext,
            ProjectRepository projectRepository) : base(userRepository, currentUserContext)
        {
            UserRepository = userRepository;
            GroupRepository = groupRepository;
            CurrentUserContext = currentUserContext;
            OrganizationRepository = organizationRepository;
            ProjectRepository = projectRepository;
            OrganizationContext = organizationContext;
        }

        public bool IsValid(int id, Project project)
        {
            CurrentUserOrgIds = CurrentUser.OrganizationIds.OrEmpty();
            var original = ProjectRepository.Get()
                              .Where(p => p.Id == id)
                              .Include(p => p.Organization)
                              .Include(p => p.Owner)
                                      .ThenInclude(u => u.OrganizationMemberships)
                                           .ThenInclude(om => om.Organization)
                              .Include(p => p.Group)
                                 .ThenInclude(g => g.Owner)
                              .FirstOrDefaultAsync().Result;
            ValidateOrganizationHeader(original.OrganizationId, "project");
            if ((project.OrganizationId != VALUE_NOT_SET)
                || (project.OwnerId != VALUE_NOT_SET)
                || (project.GroupId != VALUE_NOT_SET))
            {
                ProjectOwner = original.Owner;
                Organization = original.Organization;
                Group = original.Group;
                // Set the fields to what would be the updated versions
                // Fields that don't change, get their value from the original
                if (project.OrganizationId != VALUE_NOT_SET)
                {
                    Organization = OrganizationRepository.Get()
                            .Where(o => o.Id == project.OrganizationId)
                            .FirstOrDefaultAsync().Result;
                }
                if (project.GroupId != VALUE_NOT_SET)
                {
                    Group = GroupRepository.Get()
                            .Where(g => g.Id == project.GroupId)
                           .Include(g => g.Owner).FirstOrDefaultAsync().Result;
                }
                if (project.OwnerId != VALUE_NOT_SET)
                {
                    ProjectOwner = UserRepository.Get()
                            .Where(u => u.Id == project.OwnerId)
                            .Include(u => u.OrganizationMemberships)
                                .ThenInclude(om => om.Organization)
                            .FirstOrDefaultAsync().Result;
                }

                base.ValidateProject();
            }
            return base.IsValid();
        }
    }
}
