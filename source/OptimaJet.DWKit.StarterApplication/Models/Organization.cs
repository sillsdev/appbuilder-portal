using System.Collections.Generic;
using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
    public class Organization : Identifiable
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("website-url")]
        public string WebsiteUrl { get; set; }

        [Attr("build-engine-url")]
        public string BuildEngineUrl { get; set; }

        [Attr("build-engine-api-access-token")]
        public string BuildEngineApiAccessToken { get; set; }

        [HasOne("owner")]
        public virtual User Owner { get; set; }
        public int OwnerId { get; set; }

        [HasMany("organization-memberships", Link.None)]
        public virtual List<OrganizationMembership> OrganizationMemberships { get; set; }

        [HasMany("organization-product-definitions", Link.None)]
        public virtual List<OrganizationProductDefinition> OrganizationProductDefinitions { get; set;}
    }
}
