using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using JsonApiDotNetCore.Serialization;
using JsonApiDotNetCore.Services;
using Optimajet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests
{

    public class BaseTest<TStartup> where TStartup : class
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

        public async Task<HttpResponseMessage> Get(string url)
        {
          var httpMethod = new HttpMethod("GET");
          var request = new HttpRequestMessage(httpMethod, url);

          /* request.Headers.Add("X-Hello", "world"); */

          var body = await _fixture.Client.SendAsync(request);

          /* System.Console.WriteLine(body); */

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
    }
}
