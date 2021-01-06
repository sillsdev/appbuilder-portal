using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
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
            ProjectService projectService,
            UserService userService)
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)
        {
            BuildEngineProjectService = buildEngineProjectService;
            ProjectService = projectService;
        }

        public IBuildEngineProjectService BuildEngineProjectService { get; }
        public ProjectService ProjectService { get; }

        [HttpPost("{id}/token")]
        public async Task<IActionResult> GetProjectToken(int id)
        {
            var project = await service.GetAsync(id);
            if (project == null)
            {
                return NotFound($"Project id={id} not found");
            }

            if (project.WorkflowProjectUrl == null)
            {
                return NotFound($"Project id={id}: WorkflowProjectUrl is null");
            }

            var roles = await ProjectService.GetUserRolesForProject(project, CurrentUser.Id);

            bool readOnly;
            if (CurrentUser.Id == project.OwnerId)
            {
                readOnly = false;
            } else if (roles != null && roles.Exists(role => role.RoleName == RoleName.OrganizationAdmin))
            {
                readOnly = true;
            }
            else if (CurrentUser.HasRole(RoleName.SuperAdmin)) {
                readOnly = true;
            }
            else
            {
                return NotFound($"Project id={id}, user={CurrentUser.Name} does not have permission");
            }

            var token = await BuildEngineProjectService.GetProjectTokenAsync(id, readOnly);
            if (token == null)
            {
                return NotFound($"Project id={id}: GetProjectToken returned null");
            }
            if (token.SecretAccessKey == null)
            {
                return NotFound($"Project id={id}: Token.SecretAccessKey is null");
            }
            var projectToken = new ProjectToken
            {
                Id = id,
                SessionToken = token.SessionToken,
                SecretAccessKey = token.SecretAccessKey,
                AccessKeyId = token.AccessKeyId,
                Expiration = token.Expiration,
                Url = project.WorkflowProjectUrl,
                Region = token.Region,
                ReadOnly = token.ReadOnly
            };
            return Ok(projectToken);
        }
    }
}
