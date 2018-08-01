using System;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
    [Table("OrganizationInviteRequests")]
    public class OrganizationInviteRequest : Identifiable
    {
        [Attr("name")]
        public string Name { get; set; }
        [Attr("orgAdminEmail")]
        public string OrgAdminEmail { get; set; }
        [Attr("websiteUrl")]
        public string WebsiteUrl { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime Created { get; set; } = DateTime.UtcNow;
    }
}
