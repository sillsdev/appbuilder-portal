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
        public IOrganizationContext OrganizationContext { get; set; }
        public GroupsController(
            IJsonApiContext jsonApiContext,
            IResourceService<Group> resourceService,
            IOrganizationContext organizationContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, organizationService, userService)
        {
            this.OrganizationContext = organizationContext;
        }

        [HttpPost]
        public override async Task<IActionResult> PostAsync([FromBody] Group entity)
        {
            if (OrganizationContext.InvalidOrganization) return StatusCode(StatusCodes.Status404NotFound);
            if (!OrganizationContext.HasOrganization) return StatusCode(StatusCodes.Status422UnprocessableEntity);

            entity.OwnerId = OrganizationContext.OrganizationId;

            return await base.PostAsync(entity);
        }
    }
}
