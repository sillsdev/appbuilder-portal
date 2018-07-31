using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using OptimaJet.DWKit.Application;
using React.AspNet;
using Optimajet.DWKit.StarterApplication.Data;
using Microsoft.EntityFrameworkCore;
using JsonApiDotNetCore.Extensions;
using Microsoft.AspNetCore.Mvc.Cors.Internal;
using AspNetCore.RouteAnalyzer;

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
            services.AddBackendServices();

            services.AddReact();

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

            ConfigureDatabase(services);
        }

        public virtual void ConfigureDatabase(IServiceCollection services, string name = null)
        {
            // add the db context like you normally would
            services.AddDbContext<AppDbContext>(options =>
            { // use whatever provider you want, this is just an example
                options.UseNpgsql(GetDbConnectionString());
            });
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
