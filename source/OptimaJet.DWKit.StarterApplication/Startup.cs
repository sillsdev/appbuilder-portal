using System;
using AspNetCore.RouteAnalyzer;
using Bugsnag;
using Bugsnag.AspNet.Core;
using Hangfire;
using I18Next.Net.AspNetCore;
using I18Next.Net.Backends;
using I18Next.Net.Extensions;
using JsonApiDotNetCore.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Cors.Internal;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Middleware;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Utility;
using React.AspNet;
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;
using Microsoft.AspNetCore.SignalR;
using OptimaJet.DWKit.StarterApplication.Repositories;
using Microsoft.AspNetCore.Http;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var configurationBuilder = BuildConfiguration(env);

            Configuration = configurationBuilder.Build();
        }

        public virtual IConfigurationBuilder BuildConfiguration(IHostingEnvironment env)
        {

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            return builder;
        }

        public IConfigurationRoot Configuration { get; }


        // This method gets called by the runtime. Use this method to add services to the container.
        public virtual void ConfigureServices(IServiceCollection services)
        {
            ConfigureConnectionString();

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
            services.AddAuthenticationServices(Configuration);

            services.AddReact();

            services.AddBugsnag(configuration =>
                                configuration.ApiKey = GetVarOrDefault("BUGSNAG_APIKEY", ""));

            services.AddMvc(options => {
                options.Filters.Add(new CorsAuthorizationFilterFactory("AllowAllOrigins"));
                options.Filters.Add(typeof(ErrorHandlingFilter));
                options.Filters.Add(typeof(DisabledUserFilter));

                // NOTE: Authentication is handled at the controller-level
                //       via the [Authorize] annotation
                // options.Filters.Add(typeof(Security.AuthorizationFilter));

                // This allows global checking of *either* the cookie scheme
                // or the jwt token scheme
                // options.Filters.Add(new AuthorizeFilter("Authenticated"));
            });
            services.AddSingleton<ITranslationBackend>(s => new ScriptoriaI18NextFileBackend("source/locales"));
            services.AddI18NextLocalization(i18n => i18n
                                            .IntegrateToAspNetCore()
                                            .AddBackend(new ScriptoriaI18NextFileBackend("source/locales"))
                                            .UseDefaultLanguage("en-us"));
            services.AddMvc()
                // Enable view localization and register required I18Next services
                .AddI18NextViewLocalization();

            services.AddSignalR(o => { o.EnableDetailedErrors = true; });
            services.AddSingleton<IUserIdProvider, ScriptoriaIdProvider>();

            services.AddApiServices();
            services.AddContextServices();
            services.AddBackgroundServices(Configuration);
            // services.AddAppAuthorization();

            services.AddRouteAnalyzer();

            ConfigureDatabase(services);
        }

        public virtual void ConfigureDatabase(IServiceCollection services, string name = null)
        {
            // add the db context like you normally would
            services.AddDbContext<AppDbContext>(options =>
            { // use whatever provider you want, this is just an example
                options.UseNpgsql(Configuration["ConnectionStrings:default"]);
            });
        }


        private string ConfigureConnectionString()
        {
            var dbHost = GetVarOrThrow("POSTGRES_HOST");
            var dbPort = GetVarOrDefault("POSTGRES_PORT", "5432");
            var dbDatabase = GetVarOrThrow("POSTGRES_DB");
            var dbUser = GetVarOrThrow("POSTGRES_USER");
            var dbPassword = GetVarOrThrow("POSTGRES_PASSWORD");
            var connectionString = $"Host={dbHost};Port={dbPort};Username={dbUser};Password={dbPassword};Database={dbDatabase}";
            Configuration["ConnectionStrings:default"] = connectionString;
            return connectionString;
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public virtual void Configure(IApplicationBuilder app,
                                      IHostingEnvironment env,
                                      ILoggerFactory loggerFactory,
                                      IServiceScopeFactory serviceScopeFactory,
                                      IServiceProvider serviceProvider)
        {
            app.UseAuthentication();

            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseCors("AllowAllOrigins");

            GlobalConfiguration.Configuration.UseActivator(
                new Hangfire.AspNetCore.AspNetCoreJobActivator(serviceScopeFactory));
            GlobalJobFilters.Filters.Add(
                new ErrorReportingJobFilter(serviceProvider.GetService<IClient>()));
            app.UseHangfireServer();
            var useDashBoard = GetVarOrDefault("HANGFIRE_USE_DASHBOARD", ""); 
            if (!String.IsNullOrEmpty(useDashBoard))
            {
                Log.Information("Using Hangfire Dashboard");
                app.UseHangfireDashboard();
            }

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }

            app.UseRequestLocalization(options => options.AddSupportedCultures("es-419", "en-US", "fr-FR"));
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

                //routes.MapRoute(name: "notifications", 
                    //template: "notification/test", 
                    //defaults: new { controller = "NotificationTest", action = "Index" });

                // Fallback
                routes.MapRoute(
                    name: "default",
                    template: "{controller=StarterApplication}/{action=Index}/");
            });

            app.UseSignalR(routes =>
            {
                routes.MapHub<ScriptoriaHub>("/hubs/notifications");
            });

            app.UseJsonApi();

            SendNotificationService.HubContext = (IHubContext<ScriptoriaHub>)app.ApplicationServices.GetService(typeof(IHubContext<ScriptoriaHub>));

            app.UseBuildEngine(Configuration);
            app.UseWorkflow(Configuration);
            app.UseNotifications(Configuration);
        }
    }
}
