using System;
using Serilog;

using System.Threading.Tasks;
using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Utility;
using System.Security.Claims;
using System.Linq;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class UsersController : JsonApiController<User>
    {
        private UserService _service { get; }

        public UsersController(
            IJsonApiContext jsonApiContext,
            IResourceService<User> resourceService)
        : base(jsonApiContext, resourceService)
        {
            this._service = (UserService)resourceService;
        }

        [HttpGet("current-user")]
        public async Task<IActionResult> GetCurrentUserAsync() {
            var currentUser = await HttpContext.CurrentUser();

            return Ok(currentUser);
        }
    }
}
