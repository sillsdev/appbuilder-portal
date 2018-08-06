using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.StarterApplication;
using OptimaJet.DWKit.StarterApplication.Services;

namespace SIL.AppBuilder.Portal.Backend.Tests
{

    public class NoAuthStartup : TestStartup
    {
        public NoAuthStartup(IHostingEnvironment env) : base(env)
        {}

        public override void ConfigureServices(IServiceCollection services)
        {
            services.AddApiServices();

            services.AddScoped<IScopedServiceProvider, TestScopedServiceProvider>();
            services.AddScoped<ICurrentUserContext, TestCurrentUserContext>();


            base.ConfigureDatabase(services);
        }
    }
}
