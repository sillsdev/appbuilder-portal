using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using OptimaJet.DWKit.StarterApplication;
using Optimajet.DWKit.StarterApplication.Data;
using JsonApiDotNetCore.Extensions;

namespace SIL.AppBuilder.Portal.Backend.Tests.Support
{
    public abstract class BaseApiControllerTest<TController>: BaseTest
        where TController: class
    {
        protected TController Controller { get; }

        protected BaseApiControllerTest() : base()
        {
            Controller = (TController)ServiceProvider.GetService(typeof(TController));
        }

        protected override void ConfigureServices(IServiceCollection services)
        {
            base.ConfigureServices(services);

            services.AddAuthenticationServices(Configuration);
            services.AddBackendServices();

            // Controller
            services.AddTransient<TController, TController>();
        }

        protected override void ConfigureDbContext(IServiceCollection services)
        {
            base.ServicesAddDbContext<AppDbContext>(services);
        }

    }
}
