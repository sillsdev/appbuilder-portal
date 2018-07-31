using System;
using System.IO;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Optimajet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication;
using Serilog;
using Serilog.Events;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
  public class TestScopedServiceProvider : IScopedServiceProvider
    {
        private readonly IServiceProvider _serviceProvider;
        private Mock<IHttpContextAccessor> _httpContextAccessorMock = new Mock<IHttpContextAccessor>();

        public TestScopedServiceProvider(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public object GetService(Type serviceType)
        {
            if (serviceType == typeof(IHttpContextAccessor))
            {
                return _httpContextAccessorMock.Object;
            }

            return _serviceProvider.GetService(serviceType);
        }
    }

    public class TestStartup : Startup
    {
        private static int _initCounter = 0;

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

            services.AddScoped<IScopedServiceProvider, TestScopedServiceProvider>();
        }
    }
}
