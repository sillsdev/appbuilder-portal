using System;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
	[Table("GroupMemberships")]
    public class GroupMembership : Identifiable
    {
        [HasOne("user")]
        public virtual User User { get; set; }
        public int UserId { get; set; }

        [HasOne("group")]
        public virtual Organization Group { get; set; }
        public int GroupId { get; set; }
    }
}
