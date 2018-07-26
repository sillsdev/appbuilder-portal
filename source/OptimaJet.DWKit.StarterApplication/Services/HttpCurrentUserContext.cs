using System;
using Microsoft.AspNetCore.Http;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class HttpCurrentUserContext : ICurrentUserContext
    {
        public HttpContext HttpContext { get; set; }

        private string auth0Id;
        private string email;
        private string givenName;
        private string familyName;
        private string name;
        private string authType;

        public HttpCurrentUserContext(
            IHttpContextAccessor httpContextAccessor)
        {
            this.HttpContext = httpContextAccessor.HttpContext;
        }

        private string AuthType {
            get {
                if (authType == null) {
                    authType = this.HttpContext.GetAuth0Type();
                }
                return authType;
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
                        // Use Auth0 Management API to get value
                        givenName = "Bob";
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
                        // Use Auth0 Management API to get value
                        familyName = "Smith";
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
