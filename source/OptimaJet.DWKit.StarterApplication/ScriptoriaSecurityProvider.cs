
using System;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using Microsoft.AspNetCore.Http;
using OptimaJet.DWKit.Core.Metadata;
using OptimaJet.DWKit.Core.Metadata.DbObjects;
using OptimaJet.DWKit.Core.Security;
using OptimaJet.DWKit.Security.Providers;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication
{
  public class ScriptoriaSecurityProvider : SecurityProvider
  {
    public AppDbContext DBContext { get; }

    private CurrentUserRepository currentUserRepo;
    private HttpContext currentContext;
    private ICurrentUserContext CurrentUserContext;
    private string auth0Id;

    public ScriptoriaSecurityProvider(
      CurrentUserRepository currentUserRepo,
      ICurrentUserContext currentUserContext,
      IDbContextResolver contextResolver,

      IHttpContextAccessor httpContextAccessor
    ) : base(httpContextAccessor) {
                  this.DBContext = (AppDbContext)contextResolver.GetContext();

      // this.currentContext = httpContextAccessor.HttpContext;
      this.CurrentUserContext = currentUserContext;
      // this.auth0Id = this.currentUserContext.Auth0Id;
      this.currentUserRepo = currentUserRepo;
    }

    // public override async Task<OptimaJet.DWKit.Core.Security.User> GetCurrentUserAsync()
    // {
    //   // try {
    //   //   var auth0Id = this.CurrentUserContext.Auth0Id;

    //   //   var userFromResult = this.DBContext
    //   //           .Users.Local
    //   //           .FirstOrDefault(u => u.ExternalId.Equals(auth0Id));
    //   //   var user = await this.currentUserRepo.GetCurrentUser();
    //   //   var dwUser = base.GetUserById(user.WorkflowUserId.Value);

    //   //   return dwUser;
    //   // } catch (Exception e) {
    //     return await base.GetCurrentUserAsync();
    //   // }
    // }

    // public new Core.Security.User CurrentUser {
    //   get {
    //     // TODO: need to look up some mapping between
    //     //       our users, and the DWKit users
    //     var user = this.currentUserRepo.GetCurrentUser().Result;
    //     var dwUser = base.GetUserById(user.WorkflowUserId.Value);
    //       // .SelectAsync().Result
    //       // .Where(dwUser => dwUser.Id == user.WorkflowUserId)

    //     // this.contextAccessor.HttpContext.Items["CurrentUser"] == null;

    //     return dwUser;
    //   }
    // }
  }
}
