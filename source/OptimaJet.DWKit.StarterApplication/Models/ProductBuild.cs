using System;
using System.Collections.Generic;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProductBuild : Identifiable, ITrackDate
    {
        [HasOne("product")]
        public virtual Product Product { get; set; }
        public Guid ProductId { get; set; }

        [Attr("build-id")]
        public int BuildId { get; set; }

        [Attr("version")]
        public string Version { get; set; }

        [Attr("success")]
        public bool? Success { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }

        [HasMany("product-artifacts", Link.None)]
        public virtual List<ProductArtifact> ProductArtifacts { get; set; }

        [HasMany("product-publications", Link.None)]
        public virtual List<ProductPublication> ProductPublications { get; set; }
    }
}
