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
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class OrganizationMembershipInvitesController : BaseController<OrganizationMembershipInvite>
    {
        public OrganizationMembershipInvitesController(
            IJsonApiContext jsonApiContext,
            IResourceService<OrganizationMembershipInvite> organizationMembershipService,
            ICurrentUserContext currentUserContext,
            IOrganizationContext organizationContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, organizationMembershipService, currentUserContext, organizationService, userService)
        {

        }


        public override async Task<IActionResult> PostAsync([FromBody] OrganizationMembershipInvite invite)
        {
            return await base.PostAsync(invite);
        }
    }
}
