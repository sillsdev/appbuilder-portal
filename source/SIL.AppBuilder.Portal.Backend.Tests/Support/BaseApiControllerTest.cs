using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using OptimaJet.DWKit.StarterApplication;
using Optimajet.DWKit.StarterApplication.Data;

namespace SIL.AppBuilder.Portal.Backend.Tests.Support
{
    public abstract class BaseApiControllerTest<TController>: BaseTest
        where TController: class
    {
        protected TController Controller { get; }

        protected BaseApiControllerTest()
        {
            Controller = (TController)ServiceProvider.GetService(typeof(TController));
        }

        protected override void ConfigureServices(IServiceCollection services)
        {
            base.ConfigureServices(services);

            // DbContexts
            ServicesAddDbContext<AppDbContext>(services);

            // Controller
            services.AddTransient<TController, TController>();

            // WebApi services
            /* services.AddApplicationServices();  // The live mappings */
        }
    }
}
