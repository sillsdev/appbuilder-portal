using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
    public class OrganizationMembership : Identifiable
    {
        [HasOne("user")]
        public virtual User User { get; set; }
        public int UserId { get; set; }

        [HasOne("organization")]
        public virtual Organization Organization { get; set; }
        public int OrganizationId { get; set; }
    }
}
