using System;
using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;

namespace Optimajet.DWKit.StarterApplication.Controllers
{
    public class OrganizationInvitesController : JsonApiController<OrganizationInvite>
    {
        public OrganizationInvitesController(
            IJsonApiContext jsonApiContext,
            IResourceService<OrganizationInvite> resourceService,
            ILoggerFactory loggerFactory)
        : base(jsonApiContext, resourceService, loggerFactory)
        { }
    }
}
