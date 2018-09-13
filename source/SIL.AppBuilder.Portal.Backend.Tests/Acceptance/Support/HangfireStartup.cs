using System;
using Hangfire;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    public class HangfireStartup : NoAuthStartup
    {
        protected Mock<IBackgroundJobClient> clientMock;

        public HangfireStartup(IHostingEnvironment env) : base(env)
        {
            clientMock = new Mock<IBackgroundJobClient>();
        }

        public override void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton(typeof(IBackgroundJobClient), clientMock.Object);
            services.AddSingleton(typeof(Mock<IBackgroundJobClient>), clientMock);
            base.ConfigureServices(services);
        }
    }
}
