using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.StarterApplication;

namespace SIL.AppBuilder.Portal.Backend.Tests
{

    public class NoAuthStartup : TestStartup
    {
        public NoAuthStartup(IHostingEnvironment env) : base(env)
        {}

        public override void ConfigureServices(IServiceCollection services)
        {
            services.AddBackendServices();

            services.AddScoped<IScopedServiceProvider, TestScopedServiceProvider>();
        }
    }
}
