using System;
using Auth0.ManagementApi;
using Auth0.ManagementApi.Models;
using Microsoft.AspNetCore.Http;
using OptimaJet.DWKit.StarterApplication.Utility;
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class HttpCurrentUserContext : ICurrentUserContext
    {
        public HttpContext HttpContext { get; set; }
        public Auth0ManagementApiTokenService TokenService { get; set; }

        private string auth0Id;
        private string email;
        private string givenName;
        private string familyName;
        private string name;
        private string authType;
        private ManagementApiClient managementApiClient;
        private User auth0User;

        public HttpCurrentUserContext(
            IHttpContextAccessor httpContextAccessor,
            Auth0ManagementApiTokenService tokenService)
        {
            this.HttpContext = httpContextAccessor.HttpContext;
            this.TokenService = tokenService;
        }

        private string AuthType {
            get {
                if (authType == null) {
                    authType = this.HttpContext.GetAuth0Type();
                }
                return authType;
            }
        }

        private ManagementApiClient ManagementApiClient {
            get {
                if (managementApiClient == null) {
                    var token = TokenService.Token;
                    var domainUri = new Uri(GetVarOrThrow("AUTH0_DOMAIN"));
                    managementApiClient = new ManagementApiClient(token, domainUri.Host);
                }
                return managementApiClient;
            }
        }

        private User Auth0User {
            get {
                if (auth0User == null) {
                    auth0User = ManagementApiClient.Users.GetAsync(Auth0Id, "user_metadata", true).Result;
                }
                return auth0User;
            }
        }

        public string Auth0Id {
            get {
                if (auth0Id == null) {
                    auth0Id = this.HttpContext.GetAuth0Id();
                }
                return auth0Id;
            }
        }

        public string Email {
            get {
                if (email == null) {
                    email = this.HttpContext.GetAuth0Email();
                }
                return email;
            }
        }

        public string GivenName {
            get {
                if (givenName == null) {
                    var auth = AuthType;
                    if (string.Compare(auth, "auth0", StringComparison.Ordinal) == 0) {
                        try
                        {
                            // Use Auth0 Management API to get value
                            givenName = Auth0User.UserMetadata.given_name;
                        }
                        catch (Exception ex)
                        {
                            Log.Error(ex, $"Failed to request given_name from Auth0: auth0id={Auth0Id}");
                        }
                    } else {
                        givenName = this.HttpContext.GetAuth0GivenName();
                    }
                }
                return givenName;
            }
        }

        public string FamilyName {
            get {
                if (familyName == null) {
                    var auth = AuthType;
                    if (string.Compare(auth, "auth0", StringComparison.Ordinal) == 0)
                    {
                        try
                        {
                            // Use Auth0 Management API to get value
                            familyName = Auth0User.UserMetadata.family_name;
                        }
                        catch (Exception ex)
                        {
                            Log.Error(ex, $"Failed to request family_name from Auth0: auth0id={Auth0Id}");
                        }
                    }
                    else
                    {
                        familyName = this.HttpContext.GetAuth0SurName();
                    }
                }
                return familyName;
            }
        }

        public string Name {
            get {
                if (name == null) {
                    name = this.HttpContext.GetAuth0Name();
                }
                return name;
            }
        }
    }
}
