using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;
using FluentEmail.Core.Interfaces;
using Hangfire;
using Hangfire.PostgreSql;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Forms;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using SparkPostDotNet;
using SparkPostDotNet.Core;
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;

namespace OptimaJet.DWKit.StarterApplication
{
    public static class BackendServiceExtensions
    {
        public static IServiceCollection AddApiServices(this IServiceCollection services)
        {
            // add jsonapi dotnet core
            // - includes IHttpContextAccessor as a singleton
            services.AddJsonApi<AppDbContext>(options => {
                options.Namespace = "api";
            });

            services.AddHttpContextAccessor();

            // Add service / repository overrides
            services.AddScoped<IEntityRepository<User>, UserRepository>();
            services.AddScoped<IEntityRepository<Group>, GroupRepository>();
            services.AddScoped<IEntityRepository<Project>, ProjectRepository>();
            services.AddScoped<IEntityRepository<Organization>, OrganizationRepository>();
            services.AddScoped<IEntityRepository<OrganizationInviteRequest>, OrganizationInviteRequestRepository>();
            services.AddScoped<IEntityRepository<Product>, ProductRepository>();
            services.AddScoped<IResourceService<User>, UserService>();
            services.AddScoped<IResourceService<Organization>, OrganizationService>();
            services.AddScoped<IResourceService<Group>, GroupService>();
            services.AddScoped<IResourceService<Project>, ProjectService>();
            services.AddScoped<IResourceService<Product>, ProductService>();

            services.AddScoped<UserRepository>();
            services.AddScoped<GroupRepository>();
            services.AddScoped<ProjectRepository>();
            services.AddScoped<OrganizationRepository>();
            services.AddScoped<CurrentUserRepository>();

            services.AddScoped<UserService>();
            services.AddScoped<OrganizationService>();
            services.AddScoped<GroupService>();
            services.AddScoped<Auth0ManagementApiTokenService>();

            services.AddScoped<IOrganizationContext, HttpOrganizationContext>();
            services.AddScoped<ICurrentUserContext, HttpCurrentUserContext>();

            return services;
        }

        public static IServiceCollection AddBackgroundServices(this IServiceCollection services, IConfigurationRoot configuration)
        {
            var mailSender = GetVarOrDefault("MAIL_SENDER", "LogEmail");
            switch (mailSender) {
                case "SparkPost":
                    services.AddScoped(typeof(ISender), typeof(SparkPostSender));
                    services.Configure<SparkPostOptions>(options => options.ApiKey = GetVarOrThrow("MAIL_SPARKPOST_APIKEY"));
                    services.AddSparkPost();
                    break;
                default: services.AddScoped(typeof(ISender), typeof(LogEmailSender)); break;
            }
            services.AddFluentEmail(GetVarOrDefault("ADMIN_EMAIL", "noreply@scriptoria.io"), GetVarOrDefault("ADMIN_NAME", "Scriptoria Mailer"))
                    .AddRazorRenderer();

            services.AddScoped(typeof(IJobRepository<>), typeof(JobRepository<>));
            services.AddScoped<IJobRepository<Email>, JobEmailRepository>();

            services.AddHangfire(config =>
                                 config.UsePostgreSqlStorage(configuration["ConnectionStrings:default"]));

            services.AddScoped(typeof(IOrganizationInviteRequestService), typeof(OrganizationInviteRequestService));
            services.Configure<OrganizationInviteRequestSettings>(options =>
            {
                options.SuperAdminEmail = GetVarOrDefault("SUPERADMIN_EMAIL", "chris_hubbard@sil.org");
                options.BaseUrl = GetVarOrDefault("UI_URL", "http://localhost:9091");
            });

            services.AddScoped(typeof(IEmailService), typeof(EmailService));

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
