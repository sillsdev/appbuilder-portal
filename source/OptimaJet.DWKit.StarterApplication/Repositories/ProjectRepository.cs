using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using static OptimaJet.DWKit.StarterApplication.Utility.IEnumerableExtensions;
using static OptimaJet.DWKit.StarterApplication.Utility.RepositoryExtensions;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class ProjectRepository : ControllerRepository<Project>
    {
        public IOrganizationContext OrganizationContext { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public UserRepository UserRepository { get; set; }
        public GroupRepository GroupRepository { get; set; }
        public IEntityRepository<Organization> OrganizationRepository { get; set; }

        public ProjectRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext,
            UserRepository userRepository,
            GroupRepository groupRepository,
            IEntityRepository<Organization> organizationRepository,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.OrganizationContext = organizationContext;
            this.CurrentUserContext = currentUserContext;
            this.UserRepository = userRepository;
            this.GroupRepository = groupRepository;
            this.OrganizationRepository = organizationRepository;
        }
        public override IQueryable<Project> Filter(IQueryable<Project> query, FilterQuery filterQuery)
        {
            var attribute = filterQuery.Attribute;
            var value = filterQuery.Value;
            var isTargetParam = attribute.Equals("organization-header", StringComparison.OrdinalIgnoreCase);

            return query.OptionallyFilterOnQueryParam(filterQuery,
                                                      "organization-header",
                                                      UserRepository,
                                                      CurrentUserContext,
                                                      GetWithFilter,
                                                      base.Filter,
                                                      GetWithOrganizationId,
                                                      GetWithOrganizationContextAndOrgId);
        }

        private IQueryable<Project> GetWithOrganizationId(IQueryable<Project> query,
                                        IEnumerable<int> orgIds)
        {
            // Get all projects in the all the organizations that the current user is a member

            return query
                .Where(p => orgIds.Contains(p.OrganizationId));
        }
        private IQueryable<Project> GetWithOrganizationContextAndOrgId(IQueryable<Project> query,
                                        IEnumerable<int> orgIds)
        {
            // Get projects in the specified organization if that organization is accessible by the current user
            return query
                .Where(p => (p.OrganizationId == OrganizationContext.OrganizationId)
                       && (orgIds.Contains(p.OrganizationId))
                      );
        }

    }
}
