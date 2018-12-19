using System.Threading.Tasks;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize]
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

        [HttpPost]
        public override async Task<IActionResult> PostAsync([FromBody] User entity)
        {
            throw new JsonApiException(405, $"Not implemented for User resource.");
        }

        [HttpGet("current-user")]
        public async Task<IActionResult> GetCurrentUser() {
            var currentUser = CurrentUser;

            return await base.GetAsync(currentUser.Id);
        }
    }
}
