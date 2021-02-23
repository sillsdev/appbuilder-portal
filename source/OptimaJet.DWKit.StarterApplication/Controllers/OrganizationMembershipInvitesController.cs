using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using JsonApiDotNetCore.Controllers;
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
        private readonly OrganizationMembershipInviteService organizationMembershipInviteService;
        public OrganizationMembershipInvitesController(
            IJsonApiContext jsonApiContext,
            OrganizationMembershipInviteService organizationMembershipInviteService,
            ICurrentUserContext currentUserContext,
            IOrganizationContext organizationContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, organizationMembershipInviteService, currentUserContext, organizationService, userService)
        {
            this.organizationMembershipInviteService = organizationMembershipInviteService;
        }
    
        public override async Task<IActionResult> PostAsync([FromBody] OrganizationMembershipInvite entity)
        {
            entity.InvitedById = CurrentUser.Id;
            return await base.PostAsync(entity);
        }

        [HttpPatch("redeem/{token}")]
        public async Task<IActionResult> RedeemAsync([FromRoute] Guid Token)
        {
            try
            {
                var invite = await organizationMembershipInviteService.RedeemAsync(Token);
                return Ok(invite);
            }
            catch (InviteUserNotFoundException)
            {
                return Error(new JsonApiDotNetCore.Internal.Error(404, "organization-membership.invite.error.user-not-found"));
            }
            catch (InviteExpiredException)
            {
                return Error(new JsonApiDotNetCore.Internal.Error(403, "organization-membership.invite.error.expired"));
            }
            catch (InviteRedeemedException)
            {
                return Error(new JsonApiDotNetCore.Internal.Error(403, "organization-membership.invite.error.redeemed"));
            }
            catch (InviteNotFoundExcpetion)
            {
                return Error(new JsonApiDotNetCore.Internal.Error(404, "organization-membership.invite.error.not-found"));
            }
        }
    }
}
