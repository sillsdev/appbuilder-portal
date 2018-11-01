using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Forms.GroupMemberships
{
    public class DeleteForm: BaseForm
    {
        public ProjectRepository ProjectRepository { get; }
        public IEntityRepository<GroupMembership> GroupMembershipRepository { get; }

        public DeleteForm(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            IEntityRepository<GroupMembership> groupMembershipRepository,
            ICurrentUserContext currentUserContext) : base(userRepository, currentUserContext)
        {
            ProjectRepository = projectRepository;
            GroupMembershipRepository = groupMembershipRepository;
        }
        public bool IsValid(int id)
        {
            var groupMembership = GroupMembershipRepository.Get()
                                                           .Where(g => g.Id == id)
                                                           .Include(g => g.Group)
                                                           .Include(g => g.User)
                                                           .FirstOrDefaultAsync().Result;
            if (groupMembership == null)
            {
                var message = "Record being deleted not found";
                AddError(message, 404);
            }
            else
            {
                var projects = ProjectRepository.Get()
                                                .Where(p => p.GroupId == groupMembership.GroupId && p.OwnerId == groupMembership.UserId)
                                                .AsEnumerable();
                if (projects.Count() > 0)
                {
                    var message = "Project exists for this group membership";
                    AddError(message);
                }
            }                               

            return base.IsValid();
        }
    }
}
