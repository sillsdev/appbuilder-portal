using System;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class OrganizationInviteRequest : Identifiable, ITrackDate
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("orgAdminEmail")]
        public string OrgAdminEmail { get; set; }

        [Attr("websiteUrl")]
        public string WebsiteUrl { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }
    }
}
