using System;
using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication;
using Serilog;
using Serilog.Events;
using OptimaJet.DWKit.StarterApplication.Services;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios.ServiceOverrides;

namespace SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios
{

    public class BaseTestStartup : Startup
    {
        protected static int _initCounter = 0;

        public BaseTestStartup(IHostingEnvironment env) : base(env)
        {
            dotenv.net.DotEnv.Config(true, ".env.dev");

            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .CreateLogger();
        }

        public override void Configure(IApplicationBuilder app, 
                                       IHostingEnvironment env, 
                                       ILoggerFactory loggerFactory,
                                       IServiceScopeFactory serviceScopeFactory,
                                       IServiceProvider serviceProvider)
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
