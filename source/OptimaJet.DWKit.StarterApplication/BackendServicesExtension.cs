using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Optimajet.DWKit.StarterApplication.Data;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;

namespace OptimaJet.DWKit.StarterApplication
{
    public static class BackendServiceExtensions
    {
        public static IServiceCollection AddBackendServices(this IServiceCollection services)
        {
            // add jsonapi dotnet core
            // - includes IHttpContextAccessor as a singleton
            services.AddJsonApi<AppDbContext>(
                opt => opt.Namespace = "api"
            );

            /* services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>(); */

            // Add service / repository overrides
            services.AddScoped<IEntityRepository<User>, UserRepository>();
            services.AddScoped<IResourceService<User>, UserService>();
            services.AddScoped<IResourceService<Organization>, OrganizationService>();

            services.AddScoped<UserService>();
            services.AddScoped<OrganizationService>();

            services.AddScoped<IOrganizationContext, HttpOrganizationContext>();
            services.AddScoped<ICurrentUserContext, HttpCurrentUserContext>();

            return services;
        }

        public static IServiceCollection AddAuthenticationServices(this IServiceCollection services, IConfiguration configuration)
        {


            // JWT Auth disabled for now, because we need to
            // 1. Add an Auth0 Id column to the users table
            // 2. Set the DWKitRuntime.Security.CurrentUser
            // 3. Controller actions are not allowed to have multiple authentication schemes
            // 4. Cookies must be removed.
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.Authority = GetVarOrThrow("AUTH0_DOMAIN");
                options.Audience = GetVarOrThrow("AUTH0_AUDIENCE");
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        // Add the access_token as a claim, as we may actually need it
                        var accessToken = context.SecurityToken as JwtSecurityToken;

                        if (accessToken != null)
                        {
                            ClaimsIdentity identity = context.Principal.Identity as ClaimsIdentity;

                            if (identity != null)
                            {
                                identity.AddClaim(new Claim("access_token", accessToken.RawData));
                            }
                        }

                        return Task.CompletedTask;
                    }
                };
            })
            // Om nom nom
            .AddCookie(options => {
                options.ExpireTimeSpan = TimeSpan.FromDays(365);
                options.LoginPath = "/Account/Login/";

                options.ForwardDefaultSelector = ctx =>
                {
                    if (ctx.Request.Path.StartsWithSegments("/api"))
                    {
                        return "Bearer";
                    } else {
                        return "Cookies";
                    }
                };
            });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("Authenticated",
                    policy => policy
                        .AddAuthenticationSchemes(
                            JwtBearerDefaults.AuthenticationScheme,
                            CookieAuthenticationDefaults.AuthenticationScheme
                        ).RequireAuthenticatedUser()
                );
            });


            return services;
        }



    }
}
