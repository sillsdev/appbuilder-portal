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
using OptimaJet.DWKit.StarterApplication.Utility.Extensions.JSONAPI;
using static OptimaJet.DWKit.StarterApplication.Utility.IEnumerableExtensions;
using static OptimaJet.DWKit.StarterApplication.Utility.RepositoryExtensions;
using static OptimaJet.DWKit.StarterApplication.Utility.Extensions.JSONAPI.FilterQueryExtensions;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class ProjectRepository : ControllerRepository<Project>
    {
        public IOrganizationContext OrganizationContext { get; }
        public CurrentUserRepository CurrentUserRepository { get; }

    public ProjectRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            CurrentUserRepository currentUserRepository,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, contextResolver)
        {
            this.OrganizationContext = organizationContext;
            this.CurrentUserRepository = currentUserRepository;
        }

        public override IQueryable<Project> Filter(IQueryable<Project> query, FilterQuery filterQuery)
        {
            var filterOnOrganizations = OrganizationContext.IsOrganizationHeaderPresent || filterQuery.Has(ORGANIZATION_HEADER);
            
            if (!filterOnOrganizations) 
            {
                return base.Filter(query, filterQuery);
            }

            var currentUser = CurrentUserRepository.GetCurrentUser().Result;
            var orgIds = currentUser.OrganizationIds.OrEmpty();

            int specifiedOrgId;
            var hasSpecifiedOrgId = int.TryParse(filterQuery.Value, out specifiedOrgId);

            if (hasSpecifiedOrgId) {
                return query
                    .GetAllInOrganizationIds(orgIds)
                    .GetByOrganizationId(specifiedOrgId);
            }
            
            return query.GetAllInOrganizationIds(orgIds);
        }

        // This is the set of all projects that a user has access to.
        // If a project would ever need to be accessed outside of this set of projects,
        // this method should not be used.
        public override IQueryable<Project> Get() 
        {
            var currentUser = CurrentUserRepository.GetCurrentUser().Result;

            if (null == currentUser) 
            {
                throw new Exception("Current User does not exist");
            }

            var orgIds = currentUser.OrganizationIds.OrEmpty();
            var includePublicProjects = !OrganizationContext.IsOrganizationHeaderPresent;
            
            // - All public organizations
            // - All private organizations the current user has access to
            if (includePublicProjects) {
                return base.Get().Where(p => (includePublicProjects && p.Private == false) || orgIds.Contains(p.OrganizationId));
            }

            return base.Get().Where(p => orgIds.Contains(p.OrganizationId));
        }
    }
}
