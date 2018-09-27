using System;
using System.Collections.Generic;
using System.Linq;
using JsonApiDotNetCore.Internal.Query;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class RepositoryExtensions
    {
        [Obsolete("OptionallyFilterOnQueryParam is deprecated, please use FilterByOrganization instead.")]
        public static IQueryable<T> OptionallyFilterOnQueryParam<T>(
            this IQueryable<T> query,
            FilterQuery filterQuery,
            string param,
            UserRepository userRepository,
            ICurrentUserContext currentUserContext,
            Func<IQueryable<T>, string, UserRepository, ICurrentUserContext, 
                 Func<IQueryable<T>, IEnumerable<int>, IQueryable<T>>, Func<IQueryable<T>, IEnumerable<int>, IQueryable<T>>, IQueryable<T>> getMethod,
            Func<IQueryable<T>, FilterQuery, IQueryable<T>> exitFilter,
            Func<IQueryable<T>, IEnumerable<int>, IQueryable<T>> getAllQuery,
            Func<IQueryable<T>, IEnumerable<int>, IQueryable<T>> getFilteredQuery)
        {
            var attribute = filterQuery.Attribute;
            var value = filterQuery.Value;
            var isTargetParam = attribute.Equals(param, StringComparison.OrdinalIgnoreCase);

            if (isTargetParam)
            {
                return getMethod(query, value, userRepository, currentUserContext, getAllQuery, getFilteredQuery);
            }
            return exitFilter(query, filterQuery);
        }
        public static IQueryable<T> GetWithFilter<T>(IQueryable<T> query,
           string value,
           UserRepository userRepository,
           ICurrentUserContext currentUserContext,
           Func<IQueryable<T>, IEnumerable<int>, IQueryable<T>> getAllQuery,
           Func<IQueryable<T>, IEnumerable<int>, IQueryable<T>> getFilteredQuery)
        {
            var currentUser = userRepository.GetByAuth0Id(currentUserContext.Auth0Id).Result;
            var orgIds = currentUser.OrganizationIds.OrEmpty();

            if (string.IsNullOrEmpty(value))
            {

                return getAllQuery(query, orgIds);
            }
            return getFilteredQuery(query, orgIds);
        }


        public static IQueryable<T> GetAllInOrganizationIds<T>(this IQueryable<T> query, IEnumerable<int> orgIds) where T : IBelongsToOrganization, new()
        {
            return query.Where(p => orgIds.Contains(p.OrganizationId));
        }
        public static IQueryable<T> GetByOrganizationId<T>(this IQueryable<T> query, int organizationId) where T : IBelongsToOrganization, new()
        {
            return query.Where(p => p.OrganizationId == organizationId);
        }

        public static IQueryable<T> FilterByOrganization<T>(
            this IQueryable<T> query, 
            FilterQuery filterQuery,
            IEnumerable<int> allowedOrganizationIds
        ) where T : IBelongsToOrganization, new()
        {
            int specifiedOrgId;
            var hasSpecifiedOrgId = int.TryParse(filterQuery.Value, out specifiedOrgId);

            if (hasSpecifiedOrgId) {
                return query
                    .GetAllInOrganizationIds(allowedOrganizationIds)
                    .GetByOrganizationId(specifiedOrgId);
            }
            
            return query.GetAllInOrganizationIds(allowedOrganizationIds);
        }

    }

}