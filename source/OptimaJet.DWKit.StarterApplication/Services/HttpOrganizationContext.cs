using System;
using Microsoft.AspNetCore.Http;


namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class HttpOrganizationContext : IOrganizationContext
    {
        public static string ORGANIZATION_HEADER = "Organization";

        public HttpContext HttpContext { get; set; }
        public OrganizationService OrganizationService { get; set; }

        public HttpOrganizationContext 
        (
            IHttpContextAccessor httpContextAccessor,
            OrganizationService organizationService
        )
        {
            this.HttpContext = httpContextAccessor.HttpContext;
            this.OrganizationService = organizationService;
            Update();
        }

        private void Update()
        {
            HasOrganization = false;
            InvalidOrganization = false;
            var orgId = HttpContext.Request.Headers[ORGANIZATION_HEADER].ToString();

            int orgIdValue = 0;
            if (int.TryParse(orgId, out orgIdValue))
            {
                var org = OrganizationService.FindByIdOrDefaultAsync(orgIdValue).Result;
                if (org != null)
                {
                    HasOrganization = true;
                    OrganizationId = orgIdValue;
                }
                else
                {
                    InvalidOrganization = true;
                }
            }
        }

        public bool HasOrganization { get; set; }
        public bool InvalidOrganization { get; set; }
        public int OrganizationId { get; set; }
    }
}
