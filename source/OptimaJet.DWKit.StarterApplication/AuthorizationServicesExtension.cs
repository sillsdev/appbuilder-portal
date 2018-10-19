using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Policies;

namespace OptimaJet.DWKit.StarterApplication
{
  public static class AuthorizationServicesExtensions
  {
    public static IServiceCollection AddAppAuthorization(this IServiceCollection services)
    {
      services.AddAuthorization(options => 
      {
        options.AddPolicy(
          "AppBuilder",
          policy => policy.Requirements.Add(new RoleRequirement(RoleName.AppBuilder)));

        options.AddPolicy("SuperAdmin", policy => {
          policy.Requirements.Add(new RoleRequirement(RoleName.SuperAdmin));
        });

        options.AddPolicy(
          "OrganizationAdmin",
          policy => policy.Requirements.Add(new RoleRequirement(RoleName.OrganizationAdmin)));

      });

      services.AddScoped<IAuthorizationHandler, PermissionHandler>();

      return services;
    }
  }
}