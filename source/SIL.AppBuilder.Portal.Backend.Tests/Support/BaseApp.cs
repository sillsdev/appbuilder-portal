
using System;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace SIL.AppBuilder.Portal.Backend.Tests.Support
{
    public abstract class BaseApp
    {
        public const string AspNetCoreEnvironmentName = "ASPNETCORE_ENVIRONMENT";

        /// <summary>
        /// The ServiceProvider for accessing registered services.
        /// </summary>
        protected IServiceProvider ServiceProvider { get; }

        protected IConfiguration Configuration { get; }

        /// <summary>
        /// The AutoMapper instance
        /// </summary>
        /// <remarks>
        /// NOTE: Keeping this as "_mapper" to be consistent with other instance uses.
        ///  Using "Mapper" would look like the static process singleton use, which we
        ///  are specifically trying to avoid.
        /// ReSharper disable once InconsistentNaming
        /// </remarks>
        protected IMapper _mapper { get; }

        protected BaseApp()
        {
            // Establish
            var services = new ServiceCollection();
            var configuration = CreateConfiguration();
            Configuration = configuration;

            // Configure
            ConfigureServices(services);
            ConfigureDbContext(services);

            // Retain
            ServiceProvider = services.BuildServiceProvider();
        }

        /// <summary>
        /// Create a configuration
        /// </summary>
        /// <returns></returns>
        public virtual IConfiguration CreateConfiguration()
        {
            var builder = new ConfigurationBuilder();
            return builder.Build();
        }


        /// <summary>
        /// Configure the services.
        /// </summary>
        /// <param name="services"></param>
        /// <param name="configuration"></param>
        protected virtual void ConfigureServices(IServiceCollection services)
        {
            // Access to generic IConfiguration
            services.AddSingleton<IConfiguration>(Configuration);
        }

        /// <summary>
        /// Configure the Db Context.
        /// </summary>
        /// <param name="services"></param>
        /// <param name="configuration"></param>
        protected virtual void ConfigureDbContext(IServiceCollection services)
        {
        }

        /// <summary>
        /// End-process cleanup work
        /// </summary>
        public virtual void OnComplete()
        {
        }

        protected static string GetConnectionString(IConfiguration configuration, string key)
        {
            var conStr = configuration.GetConnectionString(key);
            if (string.IsNullOrEmpty(conStr))
            {
                Log.Error("Missing ConnectionString: {Key}", key);
                throw new InvalidOperationException("Missing connection string for " + key);
            }

            // TODO: Remove/hide, since shouldn't be showing the userids/passwords.
            Log.Logger.Debug("ConnectionString {Context}: {ConStr}", key, conStr);

            return conStr;
        }

    }
}
