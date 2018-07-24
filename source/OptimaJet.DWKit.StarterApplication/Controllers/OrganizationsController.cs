using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Utility;
using OptimaJet.DWKit.StarterApplication.Services;
using Serilog;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class OrganizationsController : BaseController<Organization>
    {
        public OrganizationsController(
            IJsonApiContext jsonApiContext,
            IResourceService<Organization> resourceService,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, organizationService, userService)
        { }

        [HttpPost]
        public override async Task<IActionResult> PostAsync([FromBody] Organization entity)
        {
            entity.Owner = CurrentUser;

            return await base.PostAsync(entity);
        }
    }
}
