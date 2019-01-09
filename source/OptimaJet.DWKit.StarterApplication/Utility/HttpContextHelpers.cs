using System.Threading.Tasks;
using JsonApiDotNetCore.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using Serilog;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Data;
using JsonApiDotNetCore.Data;
using Microsoft.EntityFrameworkCore;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class HttpContextHelpers
    {
        public static async Task<string> GetJWT(this HttpContext context)
        {
            var scheme = JwtBearerDefaults.AuthenticationScheme;
            var token = await context.GetTokenAsync(scheme, "access_token");

            return token;
        }

        // NOTE: User Claims of Interest:
        //   - type of name => email the user signed up with
        //   - type of http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress => email address
        //     ( this is the reliable way to get the email )
        //   - type of http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier => auth0Id
        //   - type of exp => expiration date in seconds since the epoch
        //   - type of access_token => the full JWT
        public static string TYPE_NAME_IDENTIFIER = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
        public static string GetAuth0Id(this HttpContext context)
        {
            return context
                .User.Claims
                .FirstOrDefault(c => c.Type == TYPE_NAME_IDENTIFIER)
                ?.Value;
        }

        public static string GetAuth0Type(this HttpContext context)
        {
            return context
                .User.Claims
                .FirstOrDefault(c => c.Type == TYPE_NAME_IDENTIFIER)
                ?.Value;
        }


        public static string TYPE_NAME_EMAIL = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
        public static string GetAuth0Email(this HttpContext context)
        {
            return context
                .User.Claims
                .First(c => c.Type == TYPE_NAME_EMAIL)
                ?.Value;
        }

        public static string TYPE_NAME_GIVEN_NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname";
        public static string GetAuth0GivenName(this HttpContext context)
        {
            return context
                .User.Claims
                .FirstOrDefault(c => c.Type == TYPE_NAME_GIVEN_NAME)
                ?.Value;
        }

        public static string TYPE_NAME_SUR_NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname";
        public static string GetAuth0SurName(this HttpContext context)
        {
            return context
                .User.Claims
                .FirstOrDefault(c => c.Type == TYPE_NAME_SUR_NAME)
                ?.Value;
        }

        public static string TYPE_NAME_NAME = "name";
        public static string GetAuth0Name(this HttpContext context)
        {
            return context
                .User.Claims
                .FirstOrDefault(c => c.Type == TYPE_NAME_NAME)
                ?.Value;
        }
    }
}
