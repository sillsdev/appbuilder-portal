using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
  [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
  public class NotificationsController : BaseController<Notification>
  {
    private readonly NotificationService notificationService;

    public NotificationsController(
        IJsonApiContext jsonApiContext,
        NotificationService notificationService,
        ICurrentUserContext currentUserContext,
        OrganizationService organizationService,
        UserService userService)
        : base(jsonApiContext, notificationService, currentUserContext, organizationService, userService)
    {
      this.notificationService = notificationService;
    }
    [HttpDelete("all")]
    public async Task<IActionResult> DeleteAll()
    {
      await notificationService.DeleteAllAsync();
      return Ok();
    }
  }
}
