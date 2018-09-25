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
        private bool isOrganizationHeaderPresent;
        private bool specifiedOrganizationDoesNotExist;
        private int organizationId;

        public HttpOrganizationContext(
            IHttpContextAccessor httpContextAccessor,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService
        )
        {
            this.HttpContext = httpContextAccessor.HttpContext;
            this.OrganizationService = organizationService;
            this.parsed = false;
        }

        private void Parse()
        {
            if (!parsed)
            {
                parsed = true;
                hasOrganization = false;
                specifiedOrganizationDoesNotExist = false;

                var headers = HttpContext.Request.Headers;

                isOrganizationHeaderPresent = headers.ContainsKey(ORGANIZATION_HEADER);

                var orgId = headers[ORGANIZATION_HEADER].ToString();

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
                        specifiedOrganizationDoesNotExist = true;
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
        public bool SpecifiedOrganizationDoesNotExist {
            get {
                Parse();
                return specifiedOrganizationDoesNotExist;
            }
        }
        public int OrganizationId {
            get {
                Parse();
                return organizationId;
            }
        }

        public bool IsOrganizationHeaderPresent {
            get {
                Parse();
                return isOrganizationHeaderPresent;
            }
        }
    }
}
