using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Optimajet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    public class TestStartup : Startup
    {
        private static int _initCounter = 0;

        public TestStartup(IHostingEnvironment env) : base(env)
        {
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
            name = name ?? ("$" + GetType().Name + "-" + _initCounter++);

            services.AddDbContext<AppDbContext>(opts =>
                opts.UseInMemoryDatabase("TestDb"), ServiceLifetime.Transient);
        }

        public override void ConfigureServices(IServiceCollection services)
        {
            base.ConfigureServices(services);
        }
    }
}
