using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class GroupMembership : Identifiable
    {
        [HasOne("user")]
        public virtual User User { get; set; }
        public int UserId { get; set; }

        [HasOne("group")]
        public virtual Group Group { get; set; }
        public int GroupId { get; set; }
    }
}
