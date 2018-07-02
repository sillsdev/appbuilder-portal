using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
    [Table("Organization")]
    public class Organization : Identifiable
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("websiteUrl")]
        public string WebsiteUrl { get; set; }

        [Attr("buildEngineUrl")]
        public string BuildEngineUrl { get; set; }

        [Attr("buildEngineApiAccessToken")]
        public string BuildEngineApiAccessToken { get; set; }

        [HasOne("owner")]
        public virtual User Owner { get; set; }
        public int OwnerId { get; set; }

        [HasMany("organizationMemberships")]
        public virtual List<OrganizationMembership> OrganizationMemberships { get; set; }
    }
}
