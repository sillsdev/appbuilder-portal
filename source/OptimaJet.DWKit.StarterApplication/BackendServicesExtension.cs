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
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.Application;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using OptimaJet.DWKit.StarterApplication.Services.Workflow;
using OptimaJet.DWKit.StarterApplication.Utility;
using OptimaJet.Workflow.Core.Runtime;
using Serilog;
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
                options.IncludeTotalRecordCount = true;
                options.EnableOperations = true;
            });

            services.AddHttpContextAccessor();

            // Add service / repository overrides
            services.AddScoped<IEntityRepository<User>, UserRepository>();
            services.AddScoped<IEntityRepository<UserTask>, UserTaskRepository>();
            services.AddScoped<IEntityRepository<Group>, GroupRepository>();
            services.AddScoped<IEntityRepository<Project>, ProjectRepository>();
            services.AddScoped<IEntityRepository<Organization>, OrganizationRepository>();
            services.AddScoped<IEntityRepository<OrganizationInviteRequest>, OrganizationInviteRequestRepository>();
            services.AddScoped<IEntityRepository<Notification>, NotificationRepository>();
            services.AddScoped<IEntityRepository<Product,Guid>, ProductRepository>();
            services.AddScoped<IEntityRepository<OrganizationStore>, OrganizationStoreRepository>();


            // services
            services.AddScoped<IResourceService<User>, UserService>();
            services.AddScoped<IResourceService<UserTask>, UserTaskService>();
            services.AddScoped<IResourceService<Organization>, OrganizationService>();
            services.AddScoped<IResourceService<Group>, GroupService>();
            services.AddScoped<IResourceService<Project>, ProjectService>();
            services.AddScoped<IResourceService<Product, Guid>, ProductService>();
            services.AddScoped<IResourceService<GroupMembership>, GroupMembershipService>();
            services.AddScoped<IResourceService<OrganizationMembership>, OrganizationMembershipService>();
            services.AddScoped<IResourceService<OrganizationMembershipInvite>, OrganizationMembershipInviteService>();
            services.AddScoped<IResourceService<OrganizationStore>, OrganizationStoreService>();

            services.AddScoped<IQueryParser, OrbitJSQueryParser>();

            // EventDispatchers
            services.AddScoped<IEntityHookHandler<Project>, ProjectHookNotifier>();


            services.AddScoped<UserRepository>();
            services.AddScoped<GroupRepository>();
            services.AddScoped<ProjectRepository>();
            services.AddScoped<OrganizationRepository>();
            services.AddScoped<CurrentUserRepository>();

            services.AddScoped<UserService>();
            services.AddScoped<OrganizationService>();
            services.AddScoped<GroupService>();
            services.AddScoped<Auth0ManagementApiTokenService>();
            services.AddScoped<SendNotificationService>();
            services.AddScoped(typeof(EntityHooksService<>));
            services.AddScoped<SendEmailService>();
            services.AddScoped<OrganizationMembershipService>();
            services.AddScoped<OrganizationMembershipInviteService>();

            return services;
        }

        public static IServiceCollection AddContextServices(this IServiceCollection services)
        {
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

            services.AddScoped<WebRequestWrapper>();
            services.AddScoped(typeof(IJobRepository<>), typeof(JobRepository<>));
            services.AddScoped(typeof(IJobRepository<,>), typeof(JobRepository<,>));
            services.AddScoped<IJobRepository<Email>, JobEmailRepository>();
            services.AddScoped<BuildEngineSystemMonitor>();
            services.AddScoped<BuildEngineProjectService>();
            services.AddScoped<BuildEngineProductService>();
            services.AddScoped<BuildEngineBuildService>();
            services.AddScoped<BuildEngineReleaseService>();

            services.AddHangfire(config =>
                                 config.UsePostgreSqlStorage(configuration["ConnectionStrings:default"]));

            services.AddScoped(typeof(IOrganizationInviteRequestService), typeof(OrganizationInviteRequestService));
            services.Configure<OrganizationInviteRequestSettings>(options =>
            {
                options.BaseUrl = GetVarOrDefault("UI_URL", "http://localhost:9091");
            });

            services.AddScoped(typeof(IWebClient), typeof(SystemWebClient));

            services.AddScoped(typeof(IEmailService), typeof(EmailService));
            services.AddScoped(typeof(SIL.AppBuilder.BuildEngineApiClient.IBuildEngineApi), typeof(SIL.AppBuilder.BuildEngineApiClient.BuildEngineApi));

            services.AddSingleton<WorkflowActivityMonitorService>();
            services.AddTransient<IWorkflowRuleProvider, WorkflowProductRuleProvider>();
            services.AddTransient<IWorkflowActionProvider, WorkflowProductActionProvider>();
            services.AddSingleton<WorkflowRuntime>(s =>  WorkflowInit.Runtime );

            return services;
        }

        public static IServiceCollection AddAuthenticationServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication()
            .AddJwtBearer(options =>
            {
                options.Authority = GetVarOrThrow("AUTH0_DOMAIN");
                options.Audience = GetVarOrThrow("AUTH0_AUDIENCE");
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];

                        // If the request is for our hub...
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) &&
                            (path.StartsWithSegments("/hubs")))
                        {
                            // Read the token out of the query string
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        // Add the access_token as a claim, as we may actually need it
                        var accessToken = context.SecurityToken as JwtSecurityToken;
                        ClaimsIdentity identity = context.Principal.Identity as ClaimsIdentity;
                        if (!identity.HasClaim("email_verified", "true"))
                        {
                            context.Fail("Email address is not validated");
                        }
                        if (accessToken != null)
                        {
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
