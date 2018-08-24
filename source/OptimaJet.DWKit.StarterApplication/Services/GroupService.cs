using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Forms.Groups;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using static OptimaJet.DWKit.StarterApplication.Utility.ServiceExtensions;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class GroupService : EntityResourceService<Group>
    {
        public IOrganizationContext OrganizationContext { get; private set; }
        public IJsonApiContext JsonApiContext { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public UserRepository UserRepository { get; }
        public GroupRepository GroupRepository { get; }

        public GroupService(
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext,
            UserRepository userRepository,
            IEntityRepository<Group> groupRepository,
            ILoggerFactory loggerFactory) : base(jsonApiContext, groupRepository, loggerFactory)
        {
            OrganizationContext = organizationContext;
            JsonApiContext = jsonApiContext;
            CurrentUserContext = currentUserContext;
            UserRepository = userRepository;
            GroupRepository = (GroupRepository)groupRepository;
        }


        public override async Task<IEnumerable<Group>> GetAsync()
        {
            return await GetScopedToOrganization<Group>(base.GetAsync,
                                               OrganizationContext,
                                               JsonApiContext);
        }
        public override async Task<Group> GetAsync(int id)
        {
            var groups = await GetAsync();
            return groups.SingleOrDefault(g => g.Id == id);
        }
        public override async Task<Group> UpdateAsync(int id, Group resource)
        {
            var updateForm = new UpdateForm(UserRepository,
                                             GroupRepository,
                                             OrganizationContext,
                                             CurrentUserContext);
            if (!updateForm.IsValid(id, resource))
            {
                throw new JsonApiException(updateForm.Errors);
            }
            return await base.UpdateAsync(id, resource);
        }
    }
}