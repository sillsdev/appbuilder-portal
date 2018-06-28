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
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc.Internal;
using Microsoft.AspNetCore.Mvc;
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;
using Optimajet.DWKit.StarterApplication.Data;
using Microsoft.EntityFrameworkCore;
using JsonApiDotNetCore.Extensions;

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
            // Add framework services.
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            services.AddReact();

            // JWT Auth disabled for now, because we need to 
            // 1. Add an Auth0 Id column to the users table
            // 2. Set the DWKitRuntime.Security.CurrentUser
            // 3. Controller actions are not allowed to have multiple authentication schemes
            // 4. Cookies must be removed.
            //
            // services.AddAuthentication(options =>
            // {
            //     options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            //     options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            // }).AddJwtBearer(options =>
            // {
            //     options.Authority = GetVarOrThrow("AUTH0_DOMAIN");
            //     options.Audience = GetVarOrThrow("AUTH0_AUDIENCE");
            //     options.RequireHttpsMetadata = false;
            // });

            // Authentication handeled by auth0
            // no cookies needed, as auth0 / jwt auth is state-less
            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
               .AddCookie(options => {
                    options.ExpireTimeSpan = TimeSpan.FromDays(365);
                    options.LoginPath = "/Account/Login/";
            });

            // add jsonapi dotnet core
            services.AddJsonApi<AppDbContext>(
                //opt => opt.Namespace = "api"
            );

            services.AddMvc(options => {
                options.Filters.Add(typeof(Security.AuthorizationFilter));
            });

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
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }


            app.UseAuthentication();
            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute("form", "form/{formName}/{*other}",
                    defaults: new { controller = "StarterApplication", action = "Index" });
                routes.MapRoute("flow", "flow/{flowName}/{*other}",
                    defaults: new { controller = "StarterApplication", action = "Index" });
                routes.MapRoute("account", "account/{action}",
                    defaults: new { controller = "Account", action = "Index" });
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
