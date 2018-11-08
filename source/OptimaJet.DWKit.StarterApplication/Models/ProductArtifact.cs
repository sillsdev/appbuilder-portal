using System;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProductArtifact : Identifiable, ITrackDate
    {
        [HasOne("product")]
        public virtual Product Product { get; set; }
        public Guid ProductId { get; set; }

        [Attr("artifact-type")]
        public string ArtifactType { get; set; }

        [Attr("url")]
        public string Url { get; set; }

        [Attr("file-size")]
        public Int64? FileSize { get; set; }

        [Attr("content-type")]
        public string ContentType { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }

        [NotMapped]
        public DateTime? LastModified { get; set; }
    }
}
