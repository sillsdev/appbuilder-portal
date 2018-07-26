using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class CurrentUserManager
    {
        public UserService Service { get; }
        public HttpContext Context { get; }


        public CurrentUserManager(
            UserService userService,
            HttpContext httpContext)
        {
            this.Service = userService;
            this.Context = httpContext;
        }

        public async Task<User> GetCurrentUser()
        {
            var auth0Id = this.Context.GetAuth0Id();

            var user = await this.Service.FindOrCreateUser(auth0Id);

            return user;
        }
    }
}
