using System;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Optimajet.DWKit.StarterApplication.Exceptions;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using Serilog;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class UsersController : BaseController<User>
    {

        public UsersController(
            IJsonApiContext jsonApiContext,
            IResourceService<User> resourceService,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)
        {
        }

        [HttpGet("current-user")]
        public IActionResult GetCurrentUser() {
            var currentUser = CurrentUser;

            return Ok(currentUser);
        }

    }
}
