
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using Optimajet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace SIL.AppBuilder.Portal.Backend.Tests.Support
{
    public abstract class BaseTest : BaseApp
    {
        private static int _initCounter = 0;

        public override IConfiguration CreateConfiguration()
        {
            // Build configuration
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())   // Helps VS 2017 debug mode
                .AddJsonFile("appsettings.json", optional: true)
                .AddEnvironmentVariables();

            return builder.Build();
        }


        protected void ServicesAddDbRepository(IServiceCollection services, Type serviceType, Type implementationType)
        {
            services.AddScoped(serviceType, implementationType);
        }

        protected void ServicesAddDbContext<TDbContext>(IServiceCollection services, string name = null)
            where TDbContext: AppDbContext
        {
            // Default to a temporary one-use namespace (anything unique)
            name = name ?? ("$" + GetType().Name + "-" + _initCounter++);

            services.AddDbContext<TDbContext>(opts =>
                opts.UseInMemoryDatabase(name));
        }

        public void NeedsTestData<TDbContext, TEntity>(IEnumerable<TEntity> objs)
            where TDbContext : AppDbContext
            where TEntity : class
        {
            AddTestData<TDbContext, TEntity>(objs);
        }

        private void AddTestData<TDbContext, TEntity>(IEnumerable<TEntity> objs)
            where TDbContext : AppDbContext
            where TEntity : class
        {
            var context = ServiceProvider.GetService<TDbContext>();

            var dbSet = context.Set<TEntity>();
            foreach (var obj in objs)
            {
                dbSet.Add(obj);
            }

            context.SaveChanges();
        }

        public List<TEntity> ReadTestData<TDbContext, TEntity>()
            where TDbContext : AppDbContext
            where TEntity : class
        {
            var context = ServiceProvider.GetService<TDbContext>();

            var dbSet = context.Set<TEntity>();
            return dbSet.ToList();
        }
    }
}
