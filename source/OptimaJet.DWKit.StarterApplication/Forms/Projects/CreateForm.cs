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
    public class CreateForm: BaseForm
    {
        public UserRepository UserRepository { get; set; }
        public GroupRepository GroupRepository { get; set; }
        public IEntityRepository<Organization> OrganizationRepository { get; set; }

        public CreateForm(
            UserRepository userRepository,
            GroupRepository groupRepository,
            IEntityRepository<Organization> organizationRepository)
        {
            UserRepository = userRepository;
            GroupRepository = groupRepository;
            OrganizationRepository = organizationRepository;
        }

        public bool IsValid(Project project) {
            // If these fields aren't filled in, then let the foreign key failure 
            // be reported
            var retVal = true;
            if ((project.OrganizationId != 0)
                && (project.OwnerId != 0)
                && (project.GroupId != 0))
            {
                var organization = OrganizationRepository.Get()
                        .Where(o => o.Id == project.OrganizationId)
                        .FirstOrDefaultAsync().Result;
                var group = GroupRepository.UnfilteredGet()
                       .Where(g => g.Id == project.GroupId)
                       .Include(g => g.Owner).FirstOrDefaultAsync().Result;
                var owner = UserRepository.UnfilteredGet()
                        .Where(u => u.Id == project.OwnerId)
                        .Include(u => u.GroupMemberships)
                            .ThenInclude(gm => gm.Group)
                        .Include(u => u.OrganizationMemberships)
                            .ThenInclude(om => om.Organization)
                        .FirstOrDefaultAsync().Result;
                
                if ((organization == null) || (group == null) || (owner == null))
                {
                    // Allowing it to return in these cases should cause the base to hit normal
                    // foreign key failures
                    var message = $"Project '{project.Name}': Organization Group or Owner not present or invalid";
                    Log.Error(message);
                    return true;
                }
                if (organization != group.Owner)
                {
                    retVal = false;
                    var message = $"Project '{project.Name}': Group '{group.Name}' not owned by project organization '{organization.Name}'";
                    Log.Error(message);
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
