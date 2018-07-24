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
        protected UserService userService;
        protected OrganizationService organizationService;


        public BaseController(
            IJsonApiContext jsonApiContext,
            IResourceService<T, int> resourceService,
            OrganizationService organizationService,
            UserService userService) : base(jsonApiContext, resourceService)
        {
            this.service = resourceService;
            this.jsonApiContext = jsonApiContext;
            this.userService = userService;
            this.organizationService = organizationService;
        }

        private static string CURRENT_USER_KEY = "CurrentUser";
        private static string ORGANIZATION_KEY = "Organization";

        private static string ORGANIZATION_HEADER = "Organization";

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

        public Organization CurrentOrganization
        {
            get {
                var keyExists = HttpContext.Items.ContainsKey(ORGANIZATION_KEY);

                if (keyExists) return (Organization)HttpContext.Items[ORGANIZATION_KEY];

                // current organization has not been found for this request.
                // find organziation if exists and set it.
                Organization org = null;
                var headerExists = HttpContext.Request.Headers.ContainsKey(ORGANIZATION_HEADER);
                if (headerExists) 
                {
                    var orgName = HttpContext.Request.Headers[ORGANIZATION_HEADER];
                    org = organizationService.FindByNameOrDefaultAsync(orgName).Result;
                    if (org != null) 
                    {
                        HttpContext.Items[ORGANIZATION_KEY] = org;
                    }
                }

                return org;
            }
        }
    }
}