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
    public class ProjectRepository : BaseRepository<Project>
    {
        public IOrganizationContext OrganizationContext { get; }
        public CurrentUserRepository CurrentUserRepository { get; }

    public ProjectRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            IOrganizationContext organizationContext,
            CurrentUserRepository currentUserRepository,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, currentUserRepository, contextResolver)
        {
            this.OrganizationContext = organizationContext;
        }

        public override IQueryable<Project> Filter(IQueryable<Project> query, FilterQuery filterQuery)
        {
            var filterOnOrganizations = OrganizationContext.IsOrganizationHeaderPresent || filterQuery.Has(ORGANIZATION_HEADER);
            
            // For when someone wants to view the directory
            // Any other further filtering would excessively hide
            // projects from the user.
            //
            // See: this.Get()
            if (!filterOnOrganizations) 
            {
                return base.Filter(query, filterQuery);
            }

            var orgIds = CurrentUser.OrganizationIds.OrEmpty();

            return query.FilterByOrganization(filterQuery, allowedOrganizationIds: orgIds);
        }

        // This is the set of all projects that a user has access to.
        // If a project would ever need to be accessed outside of this set of projects,
        // this method should not be used.
        public override IQueryable<Project> Get() 
        {
            var orgIds = CurrentUser.OrganizationIds.OrEmpty();
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
