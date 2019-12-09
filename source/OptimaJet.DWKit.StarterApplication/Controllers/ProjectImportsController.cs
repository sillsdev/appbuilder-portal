using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ProjectImportsController : BaseController<ProjectImport>
    {
        public ProjectImportsController(
            IJsonApiContext jsonApiContext,
            IResourceService<ProjectImport> resourceService,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)
        {
        }

        public override Task<IActionResult> PostAsync([FromBody] ProjectImport entity)
        {
            // Embedded Json needs to be escaped
            entity.ImportData = Utility.JsonUtils.UnescapeJson(entity.ImportData);

            return base.PostAsync(entity);
        }
    }
}
