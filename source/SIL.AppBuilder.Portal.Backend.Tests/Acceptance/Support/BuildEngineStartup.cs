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
        protected Mock<IBuildEngineApi> clientMock { get; set; }

        public BuildEngineStartup(IHostingEnvironment env) : base(env)
        {
            clientMock = new Mock<IBuildEngineApi>();
        }

        public override void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton(typeof(IBuildEngineApi), clientMock.Object);
            services.AddSingleton(typeof(Mock<IBuildEngineApi>), clientMock);
            services.AddScoped<BuildEngineSystemMonitor>();
            base.ConfigureServices(services);
        }
    }
}
