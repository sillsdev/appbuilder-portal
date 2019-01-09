using System;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class UserTask : Identifiable, ITrackDate
    {
        [HasOne("user", Link.None)]
        public virtual User User { get; set; }
        public int UserId { get; set; }

        [HasOne("product", Link.None)]
        public virtual Product Product { get; set; }
        public Guid ProductId { get; set; }

        [Attr("activity-name")]
        public string ActivityName { get; set; }

        [Attr("status")]
        public string Status { get; set; }

        [Attr("comment")]
        public string Comment { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }
    }
}
