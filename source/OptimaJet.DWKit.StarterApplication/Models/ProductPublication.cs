using System;
using System.Collections.Generic;
using JsonApiDotNetCore.Models;
namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProductPublication : Identifiable, ITrackDate
    {
        [HasOne("product")]
        public virtual Product Product { get; set; }
        public Guid ProductId { get; set; }

        [HasOne("product-build")]
        public virtual ProductBuild ProductBuild { get; set; }
        public int ProductBuildId { get; set; }

        // BuildEngine Release Id
        [Attr("release-id")]
        public int ReleaseId { get; set; }

        [Attr("channel")]
        public string Channel { get; set; }

        [Attr("log-url")]
        public string LogUrl { get; set; }

        [Attr("success")]
        public bool? Success { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }
    }
}