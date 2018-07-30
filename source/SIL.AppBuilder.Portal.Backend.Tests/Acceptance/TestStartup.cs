using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.StarterApplication;
using System;

namespace JsonApiDotNetCoreExampleTests
{
    public class TestStartup : Startup
    {
        public TestStartup(IHostingEnvironment env) : base(env)
        { }

        public override IServiceProvider ConfigureServices(IServiceCollection services)
        {
            base.ConfigureServices(services);
            /* services.AddScoped<IScopedServiceProvider, TestScopedServiceProvider>(); */
            return services.BuildServiceProvider();
        }
    }
}
