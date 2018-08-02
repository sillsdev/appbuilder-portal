using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using JsonApiDotNetCore.Serialization;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Optimajet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support
{

    public class BaseTest<TStartup> : IDisposable where TStartup : class
    {

        protected TestFixture<TStartup> _fixture;
        protected AppDbContext _context;
        protected IJsonApiContext _jsonApiContext;

        public BaseTest(TestFixture<TStartup> fixture)
        {
            _fixture = fixture;
            _context = fixture.GetService<AppDbContext>();
            _jsonApiContext = fixture.GetService<IJsonApiContext>();
        }

        public async Task<HttpResponseMessage> Get(string url, string organizationId = "")
        {
            var httpMethod = new HttpMethod("GET");
            var request = new HttpRequestMessage(httpMethod, url);

            request.Headers.Add("Organization", organizationId);

            var body = await _fixture.Client.SendAsync(request);

            return body;
        }

        public async Task<ICollection<T>> DeserializeList<T>(HttpResponseMessage response)
        {
            var body = await response.Content.ReadAsStringAsync();

            var deserializedBody = _fixture
              .GetService<IJsonApiDeSerializer>()
              .DeserializeList<T>(body);

            return deserializedBody;
        }

        public async Task<T> Deserialize<T>(HttpResponseMessage response)
        {
            var body = await response.Content.ReadAsStringAsync();

            var deserializedBody = _fixture
              .GetService<IJsonApiDeSerializer>()
              .Deserialize<T>(body);

            return deserializedBody;
        }

        public void NeedsTestData<TDbContext, TEntity>(IEnumerable<TEntity> objs)
            where TDbContext : DbContext
            where TEntity : class
        {
            AddTestData<TDbContext, TEntity>(objs);
        }

        private void AddTestData<TDbContext, TEntity>(IEnumerable<TEntity> objs)
            where TDbContext : DbContext
            where TEntity : class
        {
            var context = _fixture.GetService<TDbContext>();

            var dbSet = context.Set<TEntity>();

            foreach (var obj in objs)
            {
                dbSet.Add(obj);
            }

            context.SaveChanges();
        }

        public List<TEntity> ReadTestData<TDbContext, TEntity>()
            where TDbContext : DbContext
            where TEntity : class
        {
            var context = _fixture.GetService<TDbContext>();

            var dbSet = context.Set<TEntity>();
            return dbSet.ToList();
        }

        public void Dispose()
        {
            _fixture.Context.Database.EnsureDeleted();
        }
    }
}
