
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Services;
using Microsoft.AspNetCore.SignalR;
using OptimaJet.DWKit.StarterApplication.Utility;
using System.Threading.Tasks;
using JsonApiDotNetCore.Controllers;
using OptimaJet.DWKit.StarterApplication.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using JsonApiDotNetCore.Services;
using OptimaJet.DWKit.StarterApplication.Repositories;
using Microsoft.Extensions.Logging;
using JsonApiDotNetCore.Data;
using System.Linq;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace OptimaJet.DWKit.StarterApplication.Controllers
{

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class NotificationsController : BaseController<Notification>
    {
        public NotificationsController(
            IJsonApiContext jsonApiContext,
            IResourceService<Notification> resourceService,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)
        {
        }

        public override Task<IActionResult> GetAsync()
        {
            return base.GetAsync();
        }
    }

        //public class NotificationTestController : Controller
        //{
        //    private readonly IHubContext<ScriptoriaHub> _hubContext;
        //    public NotificationTestController(IHubContext<ScriptoriaHub> hubContext)
        //    {
        //        _hubContext = hubContext;
        //    }

        //    [HttpPost]
        //    [HttpPatch]
        //    public async Task<IActionResult> Index([FromBody] IDictionary<string, string> body)
        //    {
        //        await _hubContext.Clients.All.SendAsync("TestNotification");
        //        return NoContent();
        //    }   
        //}
    }


namespace OptimaJet.DWKit.StarterApplication.Repositories
{
    public class NotificationRepository : BaseRepository<Notification>
    {
        public NotificationRepository(
            ILoggerFactory loggerFactory,
            IJsonApiContext jsonApiContext,
            CurrentUserRepository currentUserRepository,
            IDbContextResolver contextResolver
        ) : base(loggerFactory, jsonApiContext, currentUserRepository, contextResolver)
        {
        }

        public override IQueryable<Notification> Get()
        {
            return base.Get().Where(n => n.User == CurrentUser);
        }
    }
}