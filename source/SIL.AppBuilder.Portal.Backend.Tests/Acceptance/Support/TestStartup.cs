using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication;
using Serilog;
using Serilog.Events;

namespace SIL.AppBuilder.Portal.Backend.Tests
{

    public class TestStartup : Startup
    {
        protected static int _initCounter = 0;

        public TestStartup(IHostingEnvironment env) : base(env)
        {
            dotenv.net.DotEnv.Config(true, ".env.dev");

            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .CreateLogger();
        }

        public override void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            app.UseMvc();
            app.UseJsonApi();
        }

        public override IConfigurationBuilder BuildConfiguration(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                  .SetBasePath(env.ContentRootPath)
                  .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                  .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                  .AddEnvironmentVariables();

            return builder;

        }

        public override void ConfigureDatabase(IServiceCollection services, string name = null)
        {
            // Default to a temporary one-use namespace (anything unique)
            // name = name ?? ("$" + GetType().Name + "-" + _initCounter++);
            name = "TestDb" + _initCounter++;

            services.AddDbContext<AppDbContext>(opts =>
                opts.UseInMemoryDatabase(name));
        }

        public override void ConfigureServices(IServiceCollection services)
        {
            base.ConfigureServices(services);

            services.AddScoped<IScopedServiceProvider, TestScopedServiceProvider>();
        }
    }
}
