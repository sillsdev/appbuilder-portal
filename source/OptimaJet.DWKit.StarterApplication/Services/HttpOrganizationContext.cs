using System;
using Microsoft.AspNetCore.Http;


namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class HttpOrganizationContext : IOrganizationContext
    {
        public static string ORGANIZATION_HEADER = "Organization";

        public HttpContext HttpContext { get; set; }
        public OrganizationService OrganizationService { get; set; }

        private bool parsed;
        private bool hasOrganization;
        private bool invalidOrganization;
        private int organizationId;

        public HttpOrganizationContext 
        (
            IHttpContextAccessor httpContextAccessor,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService
        )
        {
            this.HttpContext = httpContextAccessor.HttpContext;
            this.OrganizationService = organizationService;
            parsed = false;
        }

        private void Parse()
        {
            if (!parsed)
            {
                parsed = true;
                hasOrganization = false;
                invalidOrganization = false;
                var orgId = HttpContext.Request.Headers[ORGANIZATION_HEADER].ToString();

                int orgIdValue = 0;
                if (int.TryParse(orgId, out orgIdValue))
                {
                    var org = OrganizationService.FindByIdOrDefaultAsync(orgIdValue).Result;
                    if (org != null)
                    {
                        hasOrganization = true;
                        organizationId = orgIdValue;
                    }
                    else
                    {
                        invalidOrganization = true;
                    }
                }
            }

        }

        public bool HasOrganization {
            get {
                Parse();
                return hasOrganization;
            }
        }
        public bool InvalidOrganization {
            get {
                Parse();
                return invalidOrganization;
            }
        }
        public int OrganizationId {
            get {
                Parse();
                return organizationId;
            }
        }
    }
}
