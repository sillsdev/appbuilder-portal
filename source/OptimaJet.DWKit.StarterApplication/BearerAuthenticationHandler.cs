using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Linq;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using static OptimaJet.DWKit.StarterApplication.Utility.EnvironmentHelpers;

namespace OptimaJet.DWKit.StarterApplication
{
    public class UserManagementBearerAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public const string AuthenticationScheme = "UserManagementBearerScheme";

        public UserManagementBearerAuthenticationHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock)
            : base(options, logger, encoder, clock)
        {
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var authHeader = Context.Request.Headers["Authorization"].FirstOrDefault();

            if (string.IsNullOrEmpty(authHeader))
            {
                return AuthenticateResult.Fail("Authorization header is missing.");
            }

            // Validate the Bearer token as needed
            // You might want to perform custom validation or retrieve user information from the token.
            var token = GetVarOrThrow("USER_MANAGEMENT_TOKEN");
            if (!authHeader.EndsWith(token))
            {
                return AuthenticateResult.Fail("Authorization failure.");
            }


            // For simplicity, let's assume the token is valid and create a sample identity.
            var claims = new[] { new Claim(ClaimTypes.Name, "UserManagement") };
            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
    }
}
