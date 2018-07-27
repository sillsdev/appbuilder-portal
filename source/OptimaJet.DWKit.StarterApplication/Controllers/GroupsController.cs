using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class GroupsController : BaseController<Group>
    {
        public IOrganizationContext OrganizationContext { get; set; }
        public GroupsController(
            IJsonApiContext jsonApiContext,
            IResourceService<Group> resourceService,
            ICurrentUserContext currentUserContext,
            IOrganizationContext organizationContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)
        {
            this.OrganizationContext = organizationContext;
        }

        [HttpPost]
        public override async Task<IActionResult> PostAsync([FromBody] Group entity)
        {
            if (OrganizationContext.SpecifiedOrganizationDoesNotExist) return StatusCode(StatusCodes.Status404NotFound);
            if (!OrganizationContext.HasOrganization) return StatusCode(StatusCodes.Status422UnprocessableEntity);

            entity.OwnerId = OrganizationContext.OrganizationId;

            return await base.PostAsync(entity);
        }
    }
}
