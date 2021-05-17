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
            ProjectService projectService,
            UserService userService)
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)
        {
            BuildEngineProjectService = buildEngineProjectService;
            ProjectService = projectService;
        }

        public IBuildEngineProjectService BuildEngineProjectService { get; }
        public ProjectService ProjectService { get; }

        private static string TOKEN_USE_HEADER = "Use";
        private static string TOKEN_USE_UPLOAD = "Upload";
        private static string TOKEN_USE_DOWNLOAD = "Download";

        [HttpPost("{id}/token")]
        public async Task<IActionResult> GetProjectToken(int id)
        {
            string tokenUse = null;
            if (HttpContext.Request.Headers.ContainsKey(TOKEN_USE_HEADER))
            {
                tokenUse = HttpContext.Request.Headers[TOKEN_USE_HEADER];
            }

            var project = await service.GetAsync(id);
            if (project == null)
            {
                return NotFound($"Project id={id} not found");
            }

            if (project.WorkflowProjectUrl == null)
            {
                return NotFound($"Project id={id}: WorkflowProjectUrl is null");
            }

            // Check ownership
            bool? readOnly = null;
            if (CurrentUser.Id == project.OwnerId)
            {
                readOnly = false;
            }

            // Check roles
            if (!readOnly.HasValue)
            {
                var roles = await ProjectService.GetUserRolesForProject(project, CurrentUser.Id);

                if ((roles != null) && roles.Exists(role => role.RoleName == RoleName.OrganizationAdmin))
                {
                    readOnly = true;
                }
                else if (CurrentUser.HasRole(RoleName.SuperAdmin)) {
                    readOnly = true;
                }
            }

            // Check authors 
            if (!readOnly.HasValue)
            {
                var authors = await ProjectService.GetAuthorsForProject(project);
                Author author = null;
                if ((authors != null) && ((author = authors.Find(a => a.UserId == CurrentUser.Id)) != null))
                {
                    readOnly = !author.CanUpdate;
                }
            }

            if (!readOnly.HasValue)
            {
                var message = $"Project id={id}, user=\"{CurrentUser.Name}\" does not have permission";
                ThrowJsonErrorMessage(403, message);
            }

            if (tokenUse != null && tokenUse.Equals(TOKEN_USE_UPLOAD) && readOnly.Value)
            {
                var message = $"Project id={id}, user=\"{CurrentUser.Name}\" does not have permission to Upload";
                ThrowJsonErrorMessage(403, message);
            }

            var token = await BuildEngineProjectService.GetProjectTokenAsync(id, readOnly.Value);
            if (token == null)
            {
                var message = $"Project id={id}: GetProjectToken returned null";
                ThrowJsonErrorMessage(400, message);
            }
            if (token.SecretAccessKey == null)
            {
                var message = $"Project id={id}: Token.SecretAccessKey is null";
                ThrowJsonErrorMessage(400, message);
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

            var use = readOnly.Value ? "ReadOnly Access" : "ReadWrite Access";

            if (HttpContext.Request.Headers.ContainsKey(TOKEN_USE_HEADER))
            {
                use = HttpContext.Request.Headers[TOKEN_USE_HEADER];
            }
            ProjectService.AddTokenUse(project, CurrentUser, use);

            return Ok(projectToken);
        }
    }
}
