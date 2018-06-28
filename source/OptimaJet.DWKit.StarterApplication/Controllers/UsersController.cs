using System;
using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    public class UsersController : JsonApiController<User>
    {
        public UsersController(
            IJsonApiContext jsonApiContext,
            IResourceService<User> resourceService,
            ILoggerFactory loggerFactory)
        : base(jsonApiContext, resourceService, loggerFactory)
        { }
    }
}
