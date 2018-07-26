using System;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class OrganizationInvitesController : BaseController<OrganizationInvite>
    {
        public OrganizationInvitesController(
            IJsonApiContext jsonApiContext,
            IResourceService<OrganizationInvite> resourceService,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, organizationService, userService)
        { }

        [AllowAnonymous]
        [HttpPost("/api/organization-invites/request")]
        public IActionResult RequestOrgInvite() {
            // TODO: notify system super admin that someone is interested in
            //       using Scriptoria

            return Ok(null);
        }
    }
}
