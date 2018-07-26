using System;
using Microsoft.AspNetCore.Http;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class HttpCurrentUserContext : ICurrentUserContext
    {
        public HttpContext HttpContext { get; set; }

        private string _Auth0Id;

        public HttpCurrentUserContext(
            IHttpContextAccessor httpContextAccessor)
        {
            this.HttpContext = httpContextAccessor.HttpContext;
        }

        public string Auth0Id {
            get {
                if (_Auth0Id == null) {
                    _Auth0Id = this.HttpContext.GetAuth0Id();
                }
                return _Auth0Id;
            }
        }

    }
}
