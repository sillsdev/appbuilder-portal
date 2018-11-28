using System;
using JsonApiDotNetCore.Models;


namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class OrganizationMembershipCreateRequest : Identifiable
    {
        [Attr("email")]
        public string Email { get; set; }

        [Attr("organization-id")]
        public string OrganizationId { get; set; }
    }
}
