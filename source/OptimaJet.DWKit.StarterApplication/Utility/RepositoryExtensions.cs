using System;
using System.Collections.Generic;
using System.Linq;
using JsonApiDotNetCore.Internal.Query;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class RepositoryExtensions
    {
        public static IQueryable<T> OptionallyFilterOnQueryParam<T>(
            this IQueryable<T> query,
            FilterQuery filterQuery,
            string param,
            UserRepository userRepository,
            ICurrentUserContext currentUserContext,
            Func<IQueryable<T>, string, UserRepository, ICurrentUserContext, 
                 Func<IQueryable<T>, IEnumerable<int>, IQueryable<T>>, Func<IQueryable<T>, IEnumerable<int>, IQueryable<T>>, IQueryable<T>> getMethod,
            Func<IQueryable<T>, FilterQuery, IQueryable<T>> exitFilter,
            Func<IQueryable<T>, IEnumerable<int>, IQueryable<T>> query1,
            Func<IQueryable<T>, IEnumerable<int>, IQueryable<T>> query2)
        {
            var attribute = filterQuery.Attribute;
            var value = filterQuery.Value;
            var isTargetParam = attribute.Equals(param, StringComparison.OrdinalIgnoreCase);

            if (isTargetParam)
            {
                return getMethod(query, value, userRepository, currentUserContext, query1, query2);//filterOn(query, value);
            }
            return exitFilter(query, filterQuery);
        }
        public static IQueryable<T> GetWithFilter<T>(IQueryable<T> query,
           string value,
           UserRepository userRepository,
           ICurrentUserContext currentUserContext,
           Func<IQueryable<T>, IEnumerable<int>, IQueryable<T>> query1,
           Func<IQueryable<T>, IEnumerable<int>, IQueryable<T>> query2)
        {
            var currentUser = userRepository.GetByAuth0Id(currentUserContext.Auth0Id).Result;
            var orgIds = currentUser.OrganizationIds.OrEmpty();

            if (string.IsNullOrEmpty(value))
            {

                return query1(query, orgIds);
            }
            return query2(query, orgIds);
        }

    }

}