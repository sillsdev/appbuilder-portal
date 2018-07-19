using System.Threading.Tasks;
using JsonApiDotNetCore.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using Serilog;
using Optimajet.DWKit.StarterApplication.Models;

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

            return id;
        }

        // TODO: this probably needs to be cached if we are going to
        //       call it multiple times in a request.
        //       The caching issue / reapeted db query issue can be
        //       be avoided if we pass the current user everywhere.
        //
        //       But since it's likely we'll always be near an object
        //       that has access to the HttpContext, it may be better
        //       to memoize the user somewhere.
        public static async Task<User> CurrentUser(this HttpContext context) {
          var auth0Id = context.GetAuth0Id();
          // TODO: figure out how to get the service.
          //       it's given to us when in a controller context, but there
          //       should be a D.I. way to get at it as well.
          var currentUser = await _service.FindOrCreateUser(auth0Id);

          return currentUser;
        }

    }
}
