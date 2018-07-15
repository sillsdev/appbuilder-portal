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

        // TODO: hook into the authentication / authorization process so that every
        //       request can have access to the "current user" instance.
        //       the method that does that should be memoized.
        //
        //       once completed, this controller action should be able to be simplified to:
        //
        //       var currentUser = await HttpContext.CurrentUser;
        //
        //       ( or something like that )
        [HttpGet("current-user")]
        public async Task<IActionResult> GetCurrentUserAsync() {
            var auth0Id = HttpContext.GetAuth0Id();
            var currentUser = await _service.FindOrCreateUser(auth0Id);

            return Ok(currentUser);
        }
    }
}
