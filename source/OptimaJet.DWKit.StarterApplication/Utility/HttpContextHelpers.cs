using System.Threading.Tasks;
using JsonApiDotNetCore.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class HttpContextHelpers
    {
        public static async Task<string> GetJWT<T>(this HttpContext context) {
            var scheme = JwtBearerDefaults.AuthenticationScheme;
            var token = await context.GetTokenAsync(scheme, "access_token");

            return token;
        }

        public static string GetAuth0Id(this HttpContext context) {
            return JwtRegisteredClaimNames.Sub;
        }
        
    }
}