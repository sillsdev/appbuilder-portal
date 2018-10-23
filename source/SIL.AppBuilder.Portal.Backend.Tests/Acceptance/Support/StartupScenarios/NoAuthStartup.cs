using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using OptimaJet.DWKit.StarterApplication;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using GST.Fake.Authentication.JwtBearer;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios.ServiceOverrides;
using GST.Fake.Authentication.JwtBearer.Events;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using OptimaJet.DWKit.StarterApplication.Policies;
using OptimaJet.DWKit.StarterApplication.Models;
using System.Collections.Generic;

namespace SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios
{

    public class NoAuthStartup : BaseTestStartup
    {
        public NoAuthStartup(IHostingEnvironment env) : base(env)
        {}

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
                services.AddApiServices();

                services.AddScoped<IOrganizationContext, HttpOrganizationContext>();
                services.AddScoped<ICurrentUserContext, TestCurrentUserContext>();

                // services.AddAppAuthorization();

                services.AddScoped(typeof(IJobRepository<>), typeof(JobRepository<>));
                services.AddScoped<IScopedServiceProvider, TestScopedServiceProvider>();


                base.ConfigureDatabase(services);


                this.ConfiguredServices = services;
            }
        }
}
