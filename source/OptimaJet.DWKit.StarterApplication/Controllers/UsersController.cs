using System;
using Serilog;

using System.Threading.Tasks;
using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Utility;
using System.Security.Claims;
using System.Linq;
using Microsoft.AspNetCore.Http;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class UsersController : BaseController<User>
    {

        public UsersController(
            IJsonApiContext jsonApiContext,
            IResourceService<User> resourceService,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, organizationService, userService)
        {
        }

        [HttpGet("current-user")]
        public IActionResult GetCurrentUser() {
            var currentUser = CurrentUser;

            return Ok(currentUser);
        }
    }
}
