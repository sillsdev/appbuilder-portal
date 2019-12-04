using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class SystemStatusesController : BaseController<SystemStatus>
    {
        public SystemStatusesController(
            IJsonApiContext jsonApiContext,
            IResourceService<SystemStatus> resourceService,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)
        {
        }
    }
}