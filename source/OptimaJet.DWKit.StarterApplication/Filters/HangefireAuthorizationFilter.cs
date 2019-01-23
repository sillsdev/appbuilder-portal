using System.Linq;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Http;

namespace OptimaJet.DWKit.StarterApplication.Filters
{
    public class HangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            // why are there no user claims?
            var user = context.GetHttpContext().User;

            return user.Claims.Count() > 0;
        }
    }
}