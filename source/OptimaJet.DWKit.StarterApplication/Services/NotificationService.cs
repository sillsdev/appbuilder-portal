
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Services
{
  public class NotificationService : EntityResourceService<Notification>
  {
    public NotificationService(
      IJsonApiContext jsonApiContext, 
      IEntityRepository<Notification> entityRepository, 
      ILoggerFactory loggerFactory = null) 
    : base(jsonApiContext, entityRepository, loggerFactory)
    {
    }
  }
}