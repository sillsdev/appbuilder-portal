using System;
using System.Net.Http;
using JsonApiDotNetCore.Serialization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using JsonApiDotNetCore.Services;
using JsonApiDotNetCore.Data;
using Optimajet.DWKit.StarterApplication.Data;
using Xunit;
using OptimaJet.DWKit.StarterApplication;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    public class TestFixture<TStartup> : IDisposable where TStartup : class
    {
        private readonly TestServer _server;
        private IServiceProvider _services;

        public TestFixture()
        {
            var builder = new WebHostBuilder()
                .UseStartup<TStartup>();

            _server = new TestServer(builder);
            _services = _server.Host.Services;

            Client = _server.CreateClient();
            Context = GetService<IDbContextResolver>().GetContext() as AppDbContext;
            DeSerializer = GetService<IJsonApiDeSerializer>();
            JsonApiContext = GetService<IJsonApiContext>();
        }

        public HttpClient Client { get; set; }
        public AppDbContext Context { get; private set; }
        public IJsonApiDeSerializer DeSerializer { get; private set; }
        public IJsonApiContext JsonApiContext { get; private set; }
        public T GetService<T>() => (T)_services.GetService(typeof(T));

        private bool disposedValue = false;
        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    Client.Dispose();
                    _server.Dispose();
                }

                disposedValue = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
        }
    }
}
