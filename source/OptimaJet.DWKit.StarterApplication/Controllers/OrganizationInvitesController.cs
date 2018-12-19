using System.Threading.Tasks;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Controllers.Attributes;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Utility.Extensions;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize]
    public class OrganizationInvitesController : BaseController<OrganizationInvite>
    {
        public OrganizationInvitesController(
            IJsonApiContext jsonApiContext,
            IResourceService<OrganizationInvite> resourceService,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)
        {
        }

        [HttpPost]
        // [Authorize(Policy = "SuperAdmin")]
        public override async Task<IActionResult> PostAsync([FromBody] OrganizationInvite entity) 
            => await base.PostAsync(entity);
    }
}