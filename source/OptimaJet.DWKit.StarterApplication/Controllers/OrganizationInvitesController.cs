using System;
using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class OrganizationInvitesController : BaseController<OrganizationInvite>
    {
        public OrganizationInvitesController(
            IJsonApiContext jsonApiContext,
            IResourceService<OrganizationInvite> resourceService,
            ILoggerFactory loggerFactory)
        : base(jsonApiContext, resourceService, loggerFactory)
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
