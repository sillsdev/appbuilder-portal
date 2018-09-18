using System;
using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ReviewersController : JsonApiController<Reviewer>
    {
        public ReviewersController(IJsonApiContext jsonApiContext,
            IResourceService<Reviewer> resourceService,
            ILoggerFactory loggerFactory)
            : base(jsonApiContext, resourceService, loggerFactory)

        {
        }
    }
}
