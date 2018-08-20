using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
    public class OrganizationMembership : Identifiable
    {
        [HasOne("user")]
        public virtual User User { get; set; }

        [Attr("user-id")]
        public int UserId { get; set; }

        [HasOne("organization")]
        public virtual Organization Organization { get; set; }

        [Attr("organization-id")]
        public int OrganizationId { get; set; }
    }
}
