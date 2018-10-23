using System;
using Hangfire;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios
{
    public class HangfireStartup : NoAuthStartup
    {
        protected Mock<IBackgroundJobClient> hangfireJobClient;

        public HangfireStartup(IHostingEnvironment env) : base(env)
        {
            hangfireJobClient = new Mock<IBackgroundJobClient>();
        }

        public override void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton(typeof(IBackgroundJobClient), hangfireJobClient.Object);
            services.AddSingleton(typeof(Mock<IBackgroundJobClient>), hangfireJobClient);
            base.ConfigureServices(services);
        }
    }
}
