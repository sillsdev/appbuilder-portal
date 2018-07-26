using ApplicationInfrastructure.Repositories;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace SIL.AppBuilder.Portal.Backend.Tests.Support
{
    public abstract class BaseWebControllerTest<TController>: BaseTest
        where TController: class
    {
        protected TController Controller { get; }

        protected BaseWebControllerTest()
        {
            Controller = (TController)ServiceProvider.GetService(typeof(TController));
        }

        public override void ConfigureMapper(IMapperConfigurationExpression cfg)
        {
            // WebApi mappings
            Startup.ConfigureMapper(cfg);   // The live mappings
        }

        protected override void ConfigureServices(IServiceCollection services)
        {
            base.ConfigureServices(services);

            // DbContexts
            ServicesAddDbContext<IrxDbContext>(services);

            // Controller
            services.AddTransient<TController, TController>();

            // WebApi services
            services.AddApplicationServices();  // The live mappings
        }
    }
}
