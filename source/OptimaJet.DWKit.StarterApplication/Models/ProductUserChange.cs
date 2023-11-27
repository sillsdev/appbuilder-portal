using System;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProductUserChange : Identifiable, ITrackDate
    {
        [HasOne("product")]
        public virtual Product Product { get; set; }
        public Guid ProductId { get; set; }

        [Attr("email")]
        public string Email { get; set; }

        [Attr("change")]
        public string Change { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }

        [Attr("date-completed")]
        public DateTime? DateCompleted { get; set; }
    }
}
