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

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class OrganizationsController : JsonApiController<Organization>
    {
        public OrganizationsController(
            IJsonApiContext jsonApiContext,
            IResourceService<Organization> resourceService,
            ILoggerFactory loggerFactory)
        : base(jsonApiContext, resourceService, loggerFactory)
        { }

        [HttpPost]
        public override async Task<IActionResult> PostAsync(Organization organization)
        {
          organization.Owner = await HttpContext.CurrentUser();

          return await base.PostAsync(organization);
        }
    }
}
