using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.StarterApplication;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;

namespace SIL.AppBuilder.Portal.Backend.Tests
{

    public class NoAuthStartup : TestStartup
    {
        public NoAuthStartup(IHostingEnvironment env) : base(env)
        {}

        public override void ConfigureServices(IServiceCollection services)
        {
            services.AddApiServices();

            services.AddScoped<JobProjectRepository>();
            services.AddScoped<JobOrganizationRepository>();
            services.AddScoped<JobSystemStatusRepository>();
            services.AddScoped<IScopedServiceProvider, TestScopedServiceProvider>();
            services.AddScoped<ICurrentUserContext, TestCurrentUserContext>();

            base.ConfigureDatabase(services);
        }
    }
}
