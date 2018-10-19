using Microsoft.AspNetCore.Authorization;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Policies
{
  public class RoleRequirement : IAuthorizationRequirement
  {
      public RoleRequirement(RoleName role)
      {
          this.Role = role;
      }

      public RoleName Role { get; }
  }
}