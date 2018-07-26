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

        public HttpCurrentUserContext(
            IHttpContextAccessor httpContextAccessor)
        {
            this.HttpContext = httpContextAccessor.HttpContext;
        }

        public string Auth0Id {
            get {
                if (auth0Id == null) {
                    auth0Id = this.HttpContext.GetAuth0Id();
                }
                return auth0Id;
            }
        }

    }
}
