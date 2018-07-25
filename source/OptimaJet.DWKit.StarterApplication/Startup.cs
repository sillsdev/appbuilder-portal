using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using OptimaJet.DWKit.Application;
using React.AspNet;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc.Internal;
using Microsoft.AspNetCore.Mvc;
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;
using Optimajet.DWKit.StarterApplication.Data;
using Microsoft.EntityFrameworkCore;
using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.Cors.Internal;
using Serilog;
using Serilog.Events;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AspNetCore.RouteAnalyzer; 

namespace OptimaJet.DWKit.StarterApplication
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();

        }

        public IConfigurationRoot Configuration { get; }


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins",
                    builder =>
                    {
                        builder.AllowAnyOrigin();
                        builder.AllowAnyMethod();
                        builder.AllowAnyHeader();
                    }
                );
            });

            // Add framework services.
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            services.AddReact();

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


            // add jsonapi dotnet core
            services.AddJsonApi<AppDbContext>(
                opt => opt.Namespace = "api"
            );

            // Add service / repository overrides
            services.AddScoped<IEntityRepository<User>, UserRepository>();
            services.AddScoped<IResourceService<User>, UserService>();
            services.AddScoped<IResourceService<Organization>, OrganizationService>();

            services.AddScoped<UserService>();
            services.AddScoped<OrganizationService>();

            services.AddScoped<IOrganizationContext, HttpOrganizationContext>();


            services.AddMvc(options => {
                options.Filters.Add(new CorsAuthorizationFilterFactory("AllowAllOrigins"));

                // NOTE: Authentication is handled at the controller-level
                //       via the [Authorize] annotation
                // options.Filters.Add(typeof(Security.AuthorizationFilter));

                // This allows global checking of *either* the cookie scheme
                // or the jwt token scheme
                // options.Filters.Add(new AuthorizeFilter("Authenticated"));
            });

            services.AddRouteAnalyzer();

            // add the db context like you normally would
            services.AddDbContext<AppDbContext>(options =>
            { // use whatever provider you want, this is just an example
                options.UseNpgsql(GetDbConnectionString());
            }, ServiceLifetime.Transient);

        }

        private string GetDbConnectionString()
        {
            return Configuration["ConnectionStrings:default"];
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            app.UseAuthentication();

            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseCors("AllowAllOrigins");

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }


            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                // View all detected routes
                routes.MapRouteAnalyzer("/routes"); // Add

                // DWKit Routes
                routes.MapRoute("form", "form/{formName}/{*other}",
                    defaults: new { controller = "StarterApplication", action = "Index" });
                routes.MapRoute("flow", "flow/{flowName}/{*other}",
                    defaults: new { controller = "StarterApplication", action = "Index" });
                routes.MapRoute("account", "account/{action}",
                    defaults: new { controller = "Account", action = "Index" });

                // Fallback
                routes.MapRoute(
                    name: "default",
                    template: "{controller=StarterApplication}/{action=Index}/");
            });


            app.UseJsonApi();

            //DWKIT Init
            Configurator.Configure(
                (IHttpContextAccessor)app.ApplicationServices.GetService(typeof(IHttpContextAccessor)),
                Configuration);
        }
    }
}
