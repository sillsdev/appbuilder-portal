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
    public class UserTaskRepository : BaseRepository<UserTask>
    {
        public CurrentUserRepository CurrentUserRepository { get; }

        public UserTaskRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            CurrentUserRepository currentUserRepository,
            EntityHooksService<UserTask> statusUpdateService,
            IDbContextResolver contextResolver
            ) : base(loggerFactory, jsonApiContext, currentUserRepository, statusUpdateService, contextResolver)
        {
            this.CurrentUserRepository = currentUserRepository;
        }

        public override IQueryable<UserTask> Filter(IQueryable<UserTask> entities, FilterQuery filterQuery)
        {         
            var all = entities.ToList();

            if (filterQuery.Has(ORGANIZATION_HEADER)) 
            {
                var orgIds = CurrentUser.OrganizationIds.OrEmpty();

                return this.FilterByOrganization(entities, filterQuery, allowedOrganizationIds: orgIds);
            }

            return base.Filter(entities, filterQuery);

        }

        public override IQueryable<UserTask> Get() 
        {
            var currentUser = this.CurrentUserRepository.GetCurrentUser().Result;
            var id = currentUser.Id;

            return base
                .Get()
                .Where(ut => ut.UserId == id);
        }

        private IQueryable<UserTask> GetAllInOrganizationIds(IQueryable<UserTask> query, IEnumerable<int> orgIds)
        {
            return query.Where(userTask => orgIds.Contains(userTask.Product.Project.OrganizationId));
        }
        private IQueryable<UserTask> GetByOrganizationId(IQueryable<UserTask> query, int organizationId)
        {
            return query.Where(userTask => userTask.Product.Project.OrganizationId == organizationId);
        }

        private IQueryable<UserTask> FilterByOrganization(
            IQueryable<UserTask> query, 
            FilterQuery filterQuery,
            IEnumerable<int> allowedOrganizationIds
        )
        {
            int specifiedOrgId;
            var hasSpecifiedOrgId = int.TryParse(filterQuery.Value, out specifiedOrgId);

            if (hasSpecifiedOrgId) {

                query = GetAllInOrganizationIds(query, allowedOrganizationIds);
                query = GetByOrganizationId(query, specifiedOrgId);

                return query;
            }
            
            return GetAllInOrganizationIds(query, allowedOrganizationIds);
        }
    }
}
