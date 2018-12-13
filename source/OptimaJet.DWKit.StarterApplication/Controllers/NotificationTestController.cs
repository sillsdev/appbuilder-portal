
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
    public class NotificationTestController : Controller
    {
        private readonly IHubContext<ScriptoriaHub> _hubContext;
        public NotificationTestController(IHubContext<ScriptoriaHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpPost]
        [HttpPatch]
        public async Task<IActionResult> Index([FromBody] Dictionary<string, object> data)
        {
            await _hubContext.Clients.All.SendAsync("Notification", data["id"]);
            return NoContent();
        }
    }
}
