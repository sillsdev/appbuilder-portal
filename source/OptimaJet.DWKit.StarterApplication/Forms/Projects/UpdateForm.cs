using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using Microsoft.EntityFrameworkCore;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Forms.Projects
{
    public class UpdateForm: BaseForm
    {
        public UserRepository UserRepository { get; set; }
        public GroupRepository GroupRepository { get; set; }
        public IEntityRepository<Organization> OrganizationRepository { get; set; }
        public ProjectRepository ProjectRepository { get; set; }
        public UpdateForm(
            UserRepository userRepository,
            GroupRepository groupRepository,
            IEntityRepository<Organization> organizationRepository,
            ProjectRepository projectRepository)
        {
            UserRepository = userRepository;
            GroupRepository = groupRepository;
            OrganizationRepository = organizationRepository;
            ProjectRepository = projectRepository;
        }

        public bool IsValid(int id, Project project)
        {
            var retVal = true;
            if ((project.OrganizationId != 0)
                || (project.OwnerId != 0)
                || (project.GroupId != 0))
            {
                var original = ProjectRepository.UnfilteredGet()
                    .Where(p => p.Id == id)
                    .Include(p => p.Organization)
                    .Include(p => p.Owner)
                    .Include(p => p.Group)
                       .ThenInclude(g => g.Owner)
                    .FirstOrDefaultAsync().Result;
                var owner = UserRepository.UnfilteredGet()
                        .Where(u => u.Id == original.OwnerId)
                        .Include(u => u.GroupMemberships)
                            .ThenInclude(gm => gm.Group)
                        .Include(u => u.OrganizationMemberships)
                            .ThenInclude(om => om.Organization)
                        .FirstOrDefaultAsync().Result;
                var organization = original.Organization;
                var group = original.Group;
                // Set the fields to what would be the updated versions
                // Fields that don't change, get their value from the original
                if (project.OrganizationId != 0)
                {
                    organization = OrganizationRepository.Get()
                            .Where(o => o.Id == project.OrganizationId)
                            .FirstOrDefaultAsync().Result;
                }
                if (project.GroupId != 0)
                {
                    group = GroupRepository.UnfilteredGet()
                            .Where(g => g.Id == project.GroupId)
                           .Include(g => g.Owner).FirstOrDefaultAsync().Result;
                }
                if (project.OwnerId != 0)
                {
                    owner = UserRepository.UnfilteredGet()
                            .Where(u => u.Id == project.OwnerId)
                            .Include(u => u.GroupMemberships)
                                .ThenInclude(gm => gm.Group)
                            .Include(u => u.OrganizationMemberships)
                                .ThenInclude(om => om.Organization)
                            .FirstOrDefaultAsync().Result;
                }

                // This only happens if the updates reference nonexistent fields
                if ((organization == null) || (group == null) || (owner == null))
                {
                    // Allowing it to return in these cases should cause the base to hit normal
                    // foreign key failures
                    var message = $"Project '{project.Name}': Organization Group or Owner not present or invalid";
                    Log.Error(message);
                    return retVal;
                }
                if (organization != group.Owner)
                {
                    retVal = false;
                    var message = $"Project '{project.Name}': Group '{group.Name}' not owned by project organization '{organization.Name}'";
                    var error = new Error(422, "Project Validation Failure", message);
                    Errors.Add(error);

                }
                if ((owner.OrganizationIds == null) || (!owner.OrganizationIds.Contains(organization.Id)))
                {
                    retVal = false;
                    var message = $"Project '{project.Name}': Owner '{owner.Name}' not a member of project organization '{organization.Name}'";
                    var error = new Error(422, "Project Validation Failure", message);
                    Errors.Add(error);
                }
            }
            return retVal;
        }

    }
}
