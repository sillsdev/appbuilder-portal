using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using Z.EntityFramework.Plus;

namespace OptimaJet.DWKit.StarterApplication.Services
{
  public class NotificationService : EntityResourceService<Notification>
  {
    private readonly IEntityRepository<Notification> notificationsRepository;
    private readonly ICurrentUserContext currentUserContext;
    private readonly UserRepository userRepository;
    protected readonly DbSet<Notification> dbSet;
    protected readonly DbContext dbContext;

    public NotificationService(
        IDbContextResolver contextResolver,
        IJsonApiContext jsonApiContext,
        IEntityRepository<Notification> entityRepository,
        ICurrentUserContext currentUserContext,
        UserRepository userRepository,
        ILoggerFactory loggerFactory = null)
    : base(jsonApiContext, entityRepository, loggerFactory)
    {
      this.notificationsRepository = entityRepository;
      this.currentUserContext = currentUserContext;
      this.userRepository = userRepository;
      this.dbContext = contextResolver.GetContext();
      this.dbSet = contextResolver.GetDbSet<Notification>();
    }

    public async Task DeleteAllAsync()
    {
      var currentUser = userRepository.GetByAuth0Id(currentUserContext.Auth0Id).Result;
      var count = await dbSet.Where(n => n.UserId == currentUser.Id).DeleteAsync();
    }
  }
}
