using System;
using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class GroupMembershipsController : JsonApiController<GroupMembership>
    {
        public GroupMembershipsController(
            IJsonApiContext jsonApiContext,
            IResourceService<GroupMembership> resourceService,
            ILoggerFactory loggerFactory)
        : base(jsonApiContext, resourceService, loggerFactory)
        { }
    }
}
