using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize]
    public class OrganizationMembershipsController : BaseController<OrganizationMembership>
    {
        public OrganizationMembershipsController(
            IJsonApiContext jsonApiContext,
            OrganizationMembershipService organizationMembershipService,
            ICurrentUserContext currentUserContext,
            IOrganizationContext organizationContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, organizationMembershipService, currentUserContext, organizationService, userService)
        {
            this.organizationMembershipService = organizationMembershipService;
        }

        private OrganizationMembershipService organizationMembershipService { get; set; }


        public override async Task<IActionResult> PostAsync([FromBody] OrganizationMembership membership)
        {
            if (membership.Email != null)
            {
                OrganizationMembership result = await organizationMembershipService.CreateByEmail(membership);
                return result == null ? StatusCode(StatusCodes.Status422UnprocessableEntity) : (IActionResult)Ok(result);
            }
            else
            {
                return await base.PostAsync(membership);
            }
        }
    }
}
