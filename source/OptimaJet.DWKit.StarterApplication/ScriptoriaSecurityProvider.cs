
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using OptimaJet.DWKit.Core.Metadata;
using OptimaJet.DWKit.Core.Metadata.DbObjects;
using OptimaJet.DWKit.Core.Security;
using OptimaJet.DWKit.Security.Providers;
using OptimaJet.DWKit.StarterApplication.Repositories;

namespace OptimaJet.DWKit.StarterApplication
{
  public class ScriptoriaSecurityProvider : SecurityProvider
  {
    private CurrentUserRepository currentUserRepo;

    public ScriptoriaSecurityProvider(
      CurrentUserRepository currentUserRepo,
      IHttpContextAccessor httpContext
    ) : base(httpContext) {
      this.currentUserRepo = currentUserRepo;
    }


    public new Core.Security.User CurrentUser {
      get {
        // TODO: need to look up some mapping between
        //       our users, and the DWKit users
        var user = this.currentUserRepo.GetCurrentUser().Result;

        return new Core.Security.User(new Guid(), user.Name);
      }
    }

    // public Task AuthorizeAsync(string login, bool remember)
    // {
    //   throw new NotImplementedException();
    // }

    // public Task<bool> CheckFormPermissionAsync(string formName, string permissionCode)
    // {
    //   throw new NotImplementedException();
    // }

    // public Task<bool> CheckFormPermissionAsync(Form form, string permissionCode)
    // {
    //   throw new NotImplementedException();
    // }

    // public bool CheckPermission(string group, string permission)
    // {
    //   throw new NotImplementedException();
    // }

    // public bool CheckPermission(Guid userId, string groupPermissionCode, string permissionCode)
    // {
    //   throw new NotImplementedException();
    // }

    // public SecurityCredential GetCredential(Guid id)
    // {
    //   throw new NotImplementedException();
    // }

    // public Task<Core.Security.User> GetCurrentUserAsync()
    // {
    //   throw new NotImplementedException();
    // }

    // public Core.Security.User GetUserById(Guid id)
    // {
    //   throw new NotImplementedException();
    // }

    // public Task SignInAsync(string login, bool remember)
    // {
    //   throw new NotImplementedException();
    // }

    // public Task SignOutAsync()
    // {
    //   throw new NotImplementedException();
    // }

    // public Task<bool> ValidateUserByLoginAsync(string login, string password)
    // {
    //   throw new NotImplementedException();
    // }

    // public bool ValidateUserByUserId(Guid userId, string password)
    // {
    //   throw new NotImplementedException();
    // }
  }
}
