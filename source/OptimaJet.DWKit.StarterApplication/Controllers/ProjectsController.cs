using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ProjectsController : BaseController<Project>
    {
        public ProjectsController(
            IJsonApiContext jsonApiContext,
            IResourceService<Project> resourceService,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService,
            IBuildEngineProjectService buildEngineProjectService,
            UserService userService)
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)
        {
            BuildEngineProjectService = buildEngineProjectService;
        }

        public IBuildEngineProjectService BuildEngineProjectService { get; }

        [HttpPost("{id}/token")]
        public async Task<IActionResult> GetProjectToken(int id)
        {
            var project = await service.GetAsync(id);
            if (project == null || project.WorkflowProjectUrl == null)
            {
                return NotFound();
            }

            var token = await BuildEngineProjectService.GetProjectTokenAsync(id);
            if (token == null || token.SecretAccessKey == null)
            {
                return NotFound();
            }
            var projectToken = new ProjectToken
            {
                Id = id,
                SessionToken = token.SessionToken,
                SecretAccessKey = token.SecretAccessKey,
                AccessKeyId = token.AccessKeyId,
                Expiration = token.Expiration,
                Url = project.WorkflowProjectUrl
            };
            return Ok(projectToken);
        }
    }
}
