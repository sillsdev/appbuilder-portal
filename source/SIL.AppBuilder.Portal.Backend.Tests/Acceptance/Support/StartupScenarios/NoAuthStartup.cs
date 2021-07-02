using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.StarterApplication;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios.ServiceOverrides;
using Hangfire;
using Moq;
using Microsoft.AspNetCore.SignalR;
using OptimaJet.DWKit.StarterApplication.Utility;
using OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using System.Linq;

namespace SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios
{

    public class NoAuthStartup : BaseTestStartup
    {
        private Mock<IBackgroundJobClient> backgroundJobClient;
        private Mock<IHubContext<JSONAPIHub>> dataHubContext;
        private Mock<IBuildEngineProjectService> projectService;
        private Mock<WebRequestWrapper> webRequestWrapper;


        public NoAuthStartup(IHostingEnvironment env) : base(env)
        {
            backgroundJobClient = new Mock<IBackgroundJobClient>();
            dataHubContext = new Mock<IHubContext<JSONAPIHub>> { DefaultValue = DefaultValue.Mock };
            projectService = new Mock<IBuildEngineProjectService>();
            webRequestWrapper = new Mock<WebRequestWrapper>();
        }

        public IServiceCollection ConfiguredServices { get; private set; }

        public override void ConfigureServices(IServiceCollection services)
            {
                // services.AddAuthentication(options =>
                // {
                //     options.DefaultScheme = FakeJwtBearerDefaults.AuthenticationScheme;
                //     options.DefaultAuthenticateScheme = FakeJwtBearerDefaults.AuthenticationScheme;
                //     options.DefaultChallengeScheme = FakeJwtBearerDefaults.AuthenticationScheme;
                // }).AddFakeJwtBearer().AddJwtBearer();
                
                // services.AddAuthorization(options =>
                // {
                //     options.AddPolicy("Authenticated",
                //         policy => {
                //             policy.AuthenticationSchemes = new List<string> {
                //                 FakeJwtBearerDefaults.AuthenticationScheme.ToString()
                //             };

                //             policy.Combine(options.DefaultPolicy);
                //         }
                                
                         
                //     );

                // });
                // services.AddMvc();
                services.AddMvcCore().AddJsonFormatters();
                services.AddApiServices();

                services.AddScoped<IOrganizationContext, HttpOrganizationContext>();
                services.AddScoped<ICurrentUserContext, TestCurrentUserContext>();

                // services.AddAppAuthorization();

                services.AddScoped(typeof(IJobRepository<>), typeof(JobRepository<>));
                services.AddScoped(typeof(IJobRepository<,>), typeof(JobRepository<,>));
                services.AddScoped<IScopedServiceProvider, TestScopedServiceProvider>();

                services.AddScoped<IHubContext<JSONAPIHub>>(s => dataHubContext.Object);

                services.AddScoped<IBackgroundJobClient>(s => backgroundJobClient.Object);
                var serviceDescriptor = services.FirstOrDefault(descriptor => descriptor.ServiceType == typeof(IBuildEngineProjectService));
                if (serviceDescriptor == null)
                {
                    services.AddScoped(s => projectService.Object);
                }

                services.AddScoped<WebRequestWrapper>(s => webRequestWrapper.Object);


                services.AddEventDispatchers();
                base.ConfigureDatabase(services);


                this.ConfiguredServices = services;

            }
        }
}
