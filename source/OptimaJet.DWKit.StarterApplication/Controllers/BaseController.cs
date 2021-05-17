using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authorization;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    public class BaseController<T> : BaseController<T, int> where T : class, IIdentifiable<int>
    {
        public BaseController(IJsonApiContext jsonApiContext, 
                              IResourceService<T, int> resourceService, 
                              ICurrentUserContext currentUserContext, 
                              OrganizationService organizationService, 
                              UserService userService) 
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)
        {
        }
    }

    public class BaseController<T, TId> : JsonApiController<T, TId>  where T : class, IIdentifiable<TId>
    {
        protected IResourceService<T, TId> service;
        protected IJsonApiContext jsonApiContext;
        protected UserService userService;
        protected OrganizationService organizationService;
        protected ICurrentUserContext currentUserContext;

        public BaseController(
            IJsonApiContext jsonApiContext,
            IResourceService<T, TId> resourceService,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService,
            UserService userService) : base(jsonApiContext, resourceService)
        {
            this.service = resourceService;
            this.jsonApiContext = jsonApiContext;
            this.userService = userService;
            this.organizationService = organizationService;
            this.currentUserContext = currentUserContext;
        }

        private static string CURRENT_USER_KEY = "CurrentUser";

        public User CurrentUser
        {
            get {
                var exists = HttpContext.Items.ContainsKey(CURRENT_USER_KEY);
                var existing = HttpContext.Items[CURRENT_USER_KEY];

                if (exists && existing != null) return (User)existing;

                // current user has not yet been found for this request.
                // find or create because users are managed by auth0 and
                // creation isn't proxied through the api.
                var user = FindOrCreateCurrentUser().Result;

                HttpContext.Items[CURRENT_USER_KEY] = user;

                return user;
            }

        }

        private async Task<User> FindOrCreateCurrentUser()
        {
            var existing = await userService.GetCurrentUser();

            if (existing != null) return existing;

            var newUser = new User
            {
                ExternalId = currentUserContext.Auth0Id,
                Email = currentUserContext.Email,
                Name = currentUserContext.Name,
                GivenName = currentUserContext.GivenName,
                FamilyName = currentUserContext.FamilyName
            };

            var newEntity = await userService.CreateAsync(newUser);

            return newEntity;
        }

        protected void ThrowJsonErrorMessage(int statusCode, string message, Exception innerException = null)
        {
            if (innerException == null)
            {
                throw new JsonApiException(statusCode, message);
            }
            throw new JsonApiException(statusCode, message, innerException);
        }
    }
}
