using System;
using Hangfire;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using SIL.AppBuilder.BuildEngineApiClient;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    public class BuildEngineStartup : HangfireStartup
    {
        protected Mock<IBuildEngineApi> buildEngineMock { get; set; }

        public BuildEngineStartup(IHostingEnvironment env) : base(env)
        {
            buildEngineMock = new Mock<IBuildEngineApi>();
        }

        public override void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton(typeof(IBuildEngineApi), buildEngineMock.Object);
            services.AddSingleton(typeof(Mock<IBuildEngineApi>), buildEngineMock);
            services.AddScoped<BuildEngineSystemMonitor>();
            base.ConfigureServices(services);
        }
    }
}
