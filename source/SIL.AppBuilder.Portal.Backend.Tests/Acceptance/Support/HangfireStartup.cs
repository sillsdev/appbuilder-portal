using System;
using Hangfire;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    public class HangfireStartup : NoAuthStartup
    {
        //protected Mock<IBackgroundJobClient> hangfireJobClient;
        //protected Mock<IRecurringJobManager> hangfireRecurringJobManager;

        public HangfireStartup(IHostingEnvironment env) : base(env)
        {
            //hangfireJobClient = new Mock<IBackgroundJobClient>();
            //hangfireRecurringJobManager = new Mock<IRecurringJobManager>();
        }

        public override void ConfigureServices(IServiceCollection services)
        {
            //services.AddSingleton(typeof(IBackgroundJobClient), hangfireJobClient.Object);
            //services.AddSingleton(typeof(Mock<IBackgroundJobClient>), hangfireJobClient);
            //services.AddSingleton(typeof(IRecurringJobManager), hangfireRecurringJobManager.Object);
            //services.AddSingleton(typeof(Mock<IRecurringJobManager>), hangfireRecurringJobManager);
            services.AddScoped(typeof(IBackgroundJobClient), typeof(Mock<IBackgroundJobClient>));
            services.AddScoped(typeof(IRecurringJobManager), typeof(Mock<IRecurringJobManager>));
            base.ConfigureServices(services);
        }
    }
}
