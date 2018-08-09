using System;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
    public class Project : Identifiable, ITrackDate
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("type")]
        public string Type { get; set; }

        [Attr("description")]
        public string Description { get; set; }

        [HasOne("owner")]
        public virtual User Owner { get; set; }
        public int OwnerId { get; set; }

        [HasOne("group")]
        public virtual Group Group { get; set; }
        public int GroupId { get; set; }

        [HasOne("organization")]
        public virtual Organization Organization { get; set; }
        public int OrganizationId { get; set; }

        [Attr("language")]
        public string Language { get; set; }

        [Attr("private")]
        public bool Private { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }

        [Attr("date-archived")]
        public DateTime? DataArchived { get; set; }
    }
}
