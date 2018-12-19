using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using OptimaJet.DWKit.StarterApplication.Models;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize]
    public class OrganizationsController : BaseController<Organization>
    {
        public OrganizationsController(
            IJsonApiContext jsonApiContext,
            IResourceService<Organization> resourceService,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)
        { }

        [HttpPost]
        public override async Task<IActionResult> PostAsync([FromBody] Organization entity)
        {
            if (entity.Owner == null)
            {
                entity.Owner = CurrentUser;
            }

            return await base.PostAsync(entity);
        }
    }
}
