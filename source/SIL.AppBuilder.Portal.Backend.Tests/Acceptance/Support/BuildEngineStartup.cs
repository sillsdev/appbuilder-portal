using System;
using Hangfire;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using OptimaJet.DWKit.StarterApplication.Utility;
using SIL.AppBuilder.BuildEngineApiClient;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    public class BuildEngineStartup : NoAuthStartup
    {

        public Mock<IBuildEngineApi> buildEngineApiMock;
        public Mock<IRecurringJobManager> recurringJobManagerMock;
        public Mock<WebRequestWrapper> webRequestWrapperMock;
        public BuildEngineStartup(IHostingEnvironment env) : base(env)
        {
            buildEngineApiMock = new Mock<IBuildEngineApi>();
            recurringJobManagerMock = new Mock<IRecurringJobManager>();
            webRequestWrapperMock = new Mock<WebRequestWrapper>();
        }

        public override void ConfigureServices(IServiceCollection services)
        {
            services.AddScoped(s => buildEngineApiMock.Object);
            services.AddScoped(s => recurringJobManagerMock.Object);
            services.AddScoped(s => webRequestWrapperMock.Object);
            services.AddScoped<BuildEngineSystemMonitor>();
            services.AddScoped<BuildEngineProjectService>();
            services.AddScoped<BuildEngineProductService>();
            services.AddScoped<BuildEngineBuildService>();
            base.ConfigureServices(services);
        }
    }
}
