using System.ComponentModel.Design;
using System.Threading.Tasks;
using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    public class BaseController<T> : JsonApiController<T>  where T : class, IIdentifiable<int>
    {
        protected IResourceService<T, int> service;
        protected IJsonApiContext jsonApiContext;
        protected ILoggerFactory loggerFactory;
        protected UserService userService;

        public BaseController(
            IJsonApiContext jsonApiContext, 
            IResourceService<T, int> resourceService, 
            ILoggerFactory loggerFactory) : base(jsonApiContext, resourceService, loggerFactory)
        {
            this.service = resourceService;
            this.jsonApiContext = jsonApiContext;
            this.loggerFactory = loggerFactory;
        }

        public BaseController(
            IJsonApiContext jsonApiContext,
            IResourceService<T, int> resourceService,
            UserService userService): base(jsonApiContext, resourceService) 
        {
            this.service = resourceService;
            this.jsonApiContext = jsonApiContext;
            this.userService = userService;
        }

        public BaseController(
            IJsonApiContext jsonApiContext,
            IResourceService<T, int> resourceService,
            ILoggerFactory loggerFactory,
            UserService userService): base(jsonApiContext, resourceService, loggerFactory) 
        {
            this.service = resourceService;
            this.jsonApiContext = jsonApiContext;
            this.loggerFactory = loggerFactory;
            this.userService = userService;
        }

        private static string CURRENT_USER_KEY = "CurrentUser";

        public User CurrentUser
        {
            get {
                var exists = HttpContext.Items.ContainsKey(CURRENT_USER_KEY);

                if (exists) return (User)HttpContext.Items[CURRENT_USER_KEY];

                // current user has not yet been found for this request.
                // find or create because users are managed by auth0 and
                // creation isn't proxied through the api.
                var auth0Id = HttpContext.GetAuth0Id();
                var user = userService.FindOrCreateUser(auth0Id).Result;

                HttpContext.Items[CURRENT_USER_KEY] = user;

                return user;      
            }
            
        }
    }
}