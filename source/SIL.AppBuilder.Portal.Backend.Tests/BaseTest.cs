using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using JsonApiDotNetCore.Serialization;
using JsonApiDotNetCore.Services;
using Optimajet.DWKit.StarterApplication.Data;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests
{
    [Collection("WebHostCollection")]
    public class BaseTest {

        protected TestFixture<TestStartup> _fixture;
        protected AppDbContext _context;
        protected IJsonApiContext _jsonApiContext;

        public BaseTest(TestFixture<TestStartup> fixture)
        {
            _fixture = fixture;
            _context = fixture.GetService<AppDbContext>();
            _jsonApiContext = fixture.GetService<IJsonApiContext>();
        }

        public async Task<HttpResponseMessage> Get(string url)
        {
          var httpMethod = new HttpMethod("GET");
          var request = new HttpRequestMessage(httpMethod, url);

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
    }
}
