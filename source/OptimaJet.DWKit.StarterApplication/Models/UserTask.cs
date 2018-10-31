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
        public int ProductId { get; set; }

        [Attr("activity-name")]
        public String ActivityName { get; set; }

        [Attr("status")]
        public String Status { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }
    }
}
