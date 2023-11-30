
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = UserManagementBearerAuthenticationHandler.AuthenticationScheme)]
    public class ProductUserChangeController : BaseController<ProductUserChange>
    {
        public ProductUserChangeController(
            IJsonApiContext jsonApiContext,
            IResourceService<ProductUserChange> resourceService,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)

        {
        }
    }
}
