using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Forms.GroupMemberships;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class GroupMembershipService : EntityResourceService<GroupMembership>
    {
        public GroupMembershipService(
            IJsonApiContext jsonApiContext,
            UserRepository userRepository,
            ProjectRepository projectRepository,
            ICurrentUserContext currentUserContext,
            IEntityRepository<GroupMembership> groupMembershipRepository,
            ILoggerFactory loggerFactory
        ) : base(jsonApiContext, groupMembershipRepository, loggerFactory)
        {
            UserRepository = userRepository;
            ProjectRepository = projectRepository;
            CurrentUserContext = currentUserContext;
            GroupMembershipRepository = groupMembershipRepository;
        }

        public UserRepository UserRepository { get; }
        public ProjectRepository ProjectRepository { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public IEntityRepository<GroupMembership> GroupMembershipRepository { get; }

        public override async Task<bool> DeleteAsync(int id)
        {
            var deleteForm = new DeleteForm(UserRepository,
                                            ProjectRepository,
                                            GroupMembershipRepository,
                                            CurrentUserContext);
            if (!deleteForm.IsValid(id))
            {
                throw new JsonApiException(deleteForm.Errors);
            }

            return await base.DeleteAsync(id);
        }
    }
}
