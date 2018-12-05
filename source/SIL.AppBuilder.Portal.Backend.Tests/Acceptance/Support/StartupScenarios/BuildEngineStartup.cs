using System;
using Hangfire;
using I18Next.Net.AspNetCore;
using I18Next.Net.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using OptimaJet.DWKit.StarterApplication.Utility;
using SIL.AppBuilder.BuildEngineApiClient;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support.TestClasses;

namespace SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios
{
    public class BuildEngineStartup : NoAuthStartup
    {

        public Mock<IBuildEngineApi> buildEngineApiMock;
        public Mock<IRecurringJobManager> recurringJobManagerMock;
        public Mock<WebRequestWrapper> webRequestWrapperMock;
        public Mock<IWebClient> webClientMock;
        public BuildEngineStartup(IHostingEnvironment env) : base(env)
        {
            buildEngineApiMock = new Mock<IBuildEngineApi>();
            recurringJobManagerMock = new Mock<IRecurringJobManager>();
            webRequestWrapperMock = new Mock<WebRequestWrapper>();
            webClientMock = new Mock<IWebClient>();
        }

        public override void ConfigureServices(IServiceCollection services)
        {
            services.AddScoped(s => buildEngineApiMock.Object);
            services.AddScoped(s => recurringJobManagerMock.Object);
            services.AddScoped(s => webRequestWrapperMock.Object);
            services.AddScoped(s => webClientMock.Object);
            services.AddScoped<BuildEngineSystemMonitor>();
            services.AddScoped<BuildEngineProjectService>();
            services.AddScoped<BuildEngineProductService>();
            services.AddScoped<BuildEngineBuildService>();
            services.AddScoped<BuildEngineReleaseService>();
            services.AddScoped<SendNotificationServiceTester>();
            services.AddI18NextLocalization(i18n => i18n
                                            .IntegrateToAspNetCore()
                                            .AddBackend(new ScriptoriaI18NextFileBackend("source/locales"))
                                            .UseDefaultLanguage("en-US"));
            services.AddMvc()
                // Enable view localization and register required I18Next services
                .AddI18NextViewLocalization();
            base.ConfigureServices(services);
        }
        public override void Configure(IApplicationBuilder app,
                               IHostingEnvironment env,
                               ILoggerFactory loggerFactory,
                               IServiceScopeFactory serviceScopeFactory,
                               IServiceProvider serviceProvider)
        {
            app.UseRequestLocalization(options => options.AddSupportedCultures("es-419", "en-us", "fr-FR"));
            base.Configure(app, env, loggerFactory, serviceScopeFactory, serviceProvider);
        }
    }
}
