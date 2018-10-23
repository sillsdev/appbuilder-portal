using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Policies
{
  public class PermissionHandler : AuthorizationHandler<RoleRequirement>
  {
      private readonly CurrentUserRepository currentUserRepository;

      public PermissionHandler(CurrentUserRepository currentUserRepository)
      {
          if(currentUserRepository == null)
              throw new ArgumentNullException(nameof(currentUserRepository));

          this.currentUserRepository = currentUserRepository;
      }

      protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, RoleRequirement requirement)
      {
          var currentUser = await this.currentUserRepository.GetCurrentUser();

          if (currentUser == null) {
              context.Fail();
              return;
          }

          var hasPermission = currentUser.HasRole(requirement.Role);

          if (hasPermission)
          {
              context.Succeed(requirement);
          }    
      }
  }
}
