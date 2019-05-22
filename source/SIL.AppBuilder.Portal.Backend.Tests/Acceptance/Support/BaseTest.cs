using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Serialization;
using JsonApiDotNetCore.Services;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using OptimaJet.DWKit.StarterApplication.Data;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication;
using Xunit;
using System.Net;
using OptimaJet.DWKit.StarterApplication.Services;
using SIL.AppBuilder.Portal.Backend.Tests.Support.StartupScenarios.ServiceOverrides;

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

        #region HTTP Request Helpers

        public async Task<HttpResponseMessage> Get(string url, string organizationId = "", bool addOrgHeader = true, bool allOrgs = false)
        {
            var httpMethod = new HttpMethod("GET");
            var request = new HttpRequestMessage(httpMethod, url);

            return await MakeRequest(request, organizationId, addOrgHeader, allOrgs);
        }

        public async Task<HttpResponseMessage> Patch(string url, object content, string organizationId = "", bool addOrgHeader = true, bool allOrgs = false)
        {
            var httpMethod = new HttpMethod("PATCH");
            var request = new HttpRequestMessage(httpMethod, url)
            {
                Content = new StringContent(
                    JsonConvert.SerializeObject(content),
                    Encoding.UTF8,
                    "application/vnd.api+json"
                )
            };

            request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/vnd.api+json");

            return await MakeRequest(request, organizationId, addOrgHeader, allOrgs);
        }

        public async Task<HttpResponseMessage> Delete(string url)
        {
            var httpMethod = new HttpMethod("DELETE");
            var request = new HttpRequestMessage(httpMethod, url);
            return await MakeRequest(request, "", false);
        }

        public async Task<HttpResponseMessage> Post(string url, object content, string organizationId = "", bool addOrgHeader = true, bool allOrgs = false, string contentType="application/vnd.api+json")
        {
            var httpMethod = new HttpMethod("POST");
            var serializedContent = content is string ? content as string : JsonConvert.SerializeObject(content);
            var request = new HttpRequestMessage(httpMethod, url)
            {
                Content = new StringContent(
                    serializedContent,
                    Encoding.UTF8,
                    contentType
                )
            };

            request.Content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

            return await MakeRequest(request, organizationId, false, allOrgs);
        }

        public object ResourcePatchPayload(
            string type,
            object id,
            Dictionary<string, object> attributes,
            Dictionary<string, object> relationships = null)
        {
            return new
            {
                data = new
                {
                    id,
                    type,
                    attributes,
                    relationships = relationships ?? new Dictionary<string, object>()
                }
            };
        }

        public async Task<HttpResponseMessage> MakeRequest(HttpRequestMessage request, string organizationId = "", bool addOrgHeader = true, bool allOrgs = false)
        {
            if (addOrgHeader)
            {
                // NOTE: HttpRequestMessage omits headers if set to empty string...
                request.Headers.Add("Organization", allOrgs ? "-" : organizationId);
            }

            var response = await _fixture.Client.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.InternalServerError) {
                var body = await response.Content.ReadAsStringAsync();

                throw new Exception("500 errors must not exist\n\n" + body);
            }

            return response;
        }

        #endregion

        #region Deserialization Helpers

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

        public async Task<Documents> DeserializeDocumentList(HttpResponseMessage response)
        {
            var body = await response.Content.ReadAsStringAsync();

            var deserializedBody = JsonConvert.DeserializeObject<Documents>(body);

            return deserializedBody;
        }


        public async Task<Document> DeserializeDocument(HttpResponseMessage response)
        {
            var body = await response.Content.ReadAsStringAsync();

            var deserializedBody = JsonConvert.DeserializeObject<Document>(body);

            return deserializedBody;
        }

        #endregion

        #region Data Helpers

        public Tuple<User, OrganizationMembership, Organization> NeedsConfiguredCurrentUser()
        {
            var currentUser = NeedsCurrentUser();
            var tuple = NeedsDefaultOrganization(currentUser);

            return Tuple.Create(currentUser, tuple.Item1, tuple.Item2);
        }

        public User NeedsCurrentUser()
        {
            var testUserData = new TestCurrentUserContext();

            var user = new User
            {
                ExternalId = testUserData.Auth0Id,
                Email = testUserData.Email,
                GivenName = testUserData.GivenName,
                FamilyName = testUserData.FamilyName,
                Name = testUserData.Name,
            };

            NeedsTestData<AppDbContext, User>(new List<User> {
                user
            });

            return user;
        }

        public Tuple<OrganizationMembership, Organization> NeedsDefaultOrganization(User forUser)
        {

            var organization = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "SIL International"
            });

            var membership = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = forUser.Id,
                OrganizationId = organization.Id
            });

            return Tuple.Create(membership, organization);
        }

        protected TEntity AddEntity<TDbContext, TEntity>(TEntity obj)
            where TDbContext : DbContext
            where TEntity : class
        {
            var context = _fixture.GetService<TDbContext>();
            var dbSet = context.Set<TEntity>();

            dbSet.Add(obj);

            context.SaveChanges();

            return obj;
        }

        protected DbSet<TEntity> GetDbSet<TEntity>() 
            where TEntity : class
        {
            var context = _fixture.GetService<AppDbContext>();
            var dbSet = context.Set<TEntity>();

            return dbSet;
        }

        protected void NeedsRoles()
        {
            NeedsTestData<AppDbContext, Role>(new List<Role> {
                new Role { RoleName = RoleName.SuperAdmin },
                new Role { RoleName = RoleName.OrganizationAdmin },
                new Role { RoleName = RoleName.AppBuilder }
            });
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

        #endregion

        public void Dispose()
        {
            _fixture.Context.Database.EnsureDeleted();
        }
    }
}
