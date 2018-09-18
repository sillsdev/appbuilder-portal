using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Services;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Controllers
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
