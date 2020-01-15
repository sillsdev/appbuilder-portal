using System;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProjectImport : Identifiable, ITrackDate
    {
        [Attr("import-data")]
        public string ImportData { get; set; }

        [HasOne("type")]
        public virtual ApplicationType Type { get; set; }
        [Attr("type-id")]
        public int? TypeId { get; set; }

        [HasOne("owner")]
        public virtual User Owner { get; set; }
        [Attr("owner-id")]
        public int? OwnerId { get; set; }

        [HasOne("group")]
        public virtual Group Group { get; set; }
        public int? GroupId { get; set; }

        [HasOne("organization")]
        public virtual Organization Organization { get; set; }
        [Attr("organization-id")]
        public int? OrganizationId { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }
    }
}
