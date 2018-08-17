using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

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
        public async Task<IActionResult> GetCurrentUser() {
            var currentUser = CurrentUser;

            System.Console.WriteLine(currentUser.Id);
            System.Console.WriteLine("hiiiiiiiiiiiiiiiiiiiii");

            return await base.GetAsync(currentUser.Id);
        }

    }
}
