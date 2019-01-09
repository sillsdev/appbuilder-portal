
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


namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    //this class is used to force a notification... could be removed.
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class NotificationTestController : Controller
    {
        private readonly IHubContext<ScriptoriaHub> _hubContext;
        private readonly UserService _userService;
        private readonly IResourceService<Notification> _notificationService;
        public NotificationTestController(IHubContext<ScriptoriaHub> hubContext,
            UserService userService,
            IResourceService<Notification> notificationService)
        {
            _hubContext = hubContext;
            _userService = userService;
            _notificationService = notificationService;
        }

        [HttpPost]
        [HttpPatch]
        public async Task<IActionResult> Index([FromBody] Dictionary<string, object> data)
        {
            var message = data["message"] as string;
            var user = _userService.GetCurrentUser().Result;
            var notification = new Notification()
            {
                User = user,
                Message = message
            };
            notification =  await _notificationService.CreateAsync(notification);
            await _hubContext.Clients.User(user.ExternalId).SendAsync("Notification", notification.Id);
            return NoContent();
        }
    }
}
