using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    public class GroupsController : BaseController<Group>
    {
        public GroupsController(
            IJsonApiContext jsonApiContext,
            IResourceService<Group> resourceService,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, organizationService, userService)
        { }

        [HttpPost]
        public override async Task<IActionResult> PostAsync([FromBody] Group entity)
        {
            var currentOrganization = CurrentOrganization;
            if (currentOrganization == null) return StatusCode(StatusCodes.Status422UnprocessableEntity);

            entity.Owner = currentOrganization;

            return await base.PostAsync(entity);
        }
    }
}
