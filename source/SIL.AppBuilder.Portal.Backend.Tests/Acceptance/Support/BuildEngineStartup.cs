using System;
using Hangfire;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using SIL.AppBuilder.BuildEngineApiClient;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    public class BuildEngineStartup : NoAuthStartup
    {
  
        public BuildEngineStartup(IHostingEnvironment env) : base(env)
        {
        }

        public override void ConfigureServices(IServiceCollection services)
        {
            services.AddScoped<BuildEngineSystemMonitor>();
            services.AddScoped<BuildEngineProjectService>();
            base.ConfigureServices(services);
        }
    }
}
