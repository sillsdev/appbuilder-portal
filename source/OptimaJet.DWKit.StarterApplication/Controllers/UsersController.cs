using System;
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

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class UsersController : JsonApiController<User>
    {
        private UserService _service { get; }

        public UsersController(
            IJsonApiContext jsonApiContext,
            IResourceService<User> resourceService,
            ILoggerFactory loggerFactory)
        : base(jsonApiContext, resourceService, loggerFactory)
        { 
            this._service = (UserService)resourceService;
        }

        [HttpGet("/current-user")]
        public async Task<IActionResult> GetCurrentUserAsync() {
            var auth0Id = HttpContext.GetAuth0Id();

            var currentUser = await _service.FindOrCreateUser(auth0Id);

            return Ok(currentUser);
        } 
    }
}
