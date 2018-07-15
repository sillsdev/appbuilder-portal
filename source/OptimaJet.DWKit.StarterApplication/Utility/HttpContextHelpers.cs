using System.Threading.Tasks;
using JsonApiDotNetCore.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class HttpContextHelpers
    {
        public static async Task<string> GetJWT(this HttpContext context) {
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
        public static string GetAuth0Id(this HttpContext context) {
            var idClaim = context.User.Claims.First(c => c.Type == TYPE_NAME_IDENTIFIER);
            var id = idClaim.Value;
            
            Log.Information("id: {0}", id);

            return id;
        }
        
    }
}