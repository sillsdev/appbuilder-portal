using System;
using System.Collections.Generic;
using System.Linq;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using static OptimaJet.DWKit.StarterApplication.Utility.RepositoryExtensions;

namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class ProductRepository : BaseRepository<Product, Guid>
    {
        public IOrganizationContext OrganizationContext { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public UserRepository UserRepository { get; set; }
        public ProductRepository(
            IOrganizationContext organizationContext,
            ICurrentUserContext currentUserContext,
            UserRepository userRepository,
            ILoggerFactory loggerFactory,
            CurrentUserRepository currentUserRepository,
            EntityHooksService<Product> statusUpdateService,
            IJsonApiContext jsonApiContext,
            IDbContextResolver contextResolver
        ) : base(loggerFactory, jsonApiContext, currentUserRepository, statusUpdateService, contextResolver)
        {
            this.OrganizationContext = organizationContext;
            this.CurrentUserContext = currentUserContext;
            this.UserRepository = userRepository;
        }
        public override IQueryable<Product> Filter(IQueryable<Product> entities, FilterQuery filterQuery)
        {
            return entities.OptionallyFilterOnQueryParam(filterQuery,
                                                      "organization-header",
                                                      UserRepository,
                                                      CurrentUserContext,
                                                      GetWithFilter,
                                                      base.Filter,
                                                      GetWithOrganizationId,
                                                      GetWithOrganizationContextAndOrgId);
        }

        private IQueryable<Product> GetWithOrganizationId(IQueryable<Product> query,
                                        IEnumerable<int> orgIds)
        {
            // Get all projects in the all the organizations that the current user is a member
            return query
                .Where(p => orgIds.Contains(p.Project.OrganizationId));
        }
        private IQueryable<Product> GetWithOrganizationContextAndOrgId(IQueryable<Product> query,
                                        IEnumerable<int> orgIds)
        {
            // Get projects in the specified organization if that organization is accessible by the current user
            return query
                .Where(p => (p.Project.OrganizationId == OrganizationContext.OrganizationId)
                       && (orgIds.Contains(p.Project.OrganizationId))
                      );
        }

    }
}
