using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Services;
using Optimajet.DWKit.StarterApplication.Models;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    public class OrganizationInviteRequestsController : JsonApiController<OrganizationInviteRequest>
    {
        public OrganizationInviteRequestsController(
            IJsonApiContext jsonApiContext,
            IResourceService<OrganizationInviteRequest> resourceService)
            : base(jsonApiContext, resourceService)
        {
        }
    }
}
