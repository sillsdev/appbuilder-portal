using System;
using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
    public class Product : Identifiable, ITrackDate
    {
        [HasOne("project")]
        public virtual Project Project { get; set; }
        public int ProjectId { get; set; }

        [HasOne("product-definition")]
        public virtual ProductDefinition ProductDefinition { get; set; }
        public int ProductDefinitionId { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }

        [Attr("workflow-job-id")]
        public int WorkflowJobId { get; set; }

        [Attr("workflow-build-id")]
        public int WorkflowBuildId { get; set; }

        [Attr("date-built")]
        public DateTime? DateBuilt { get; set; }

        [Attr("workflow-publish-id")]
        public int WorkflowPublishId { get; set; }

        [Attr("date-published")]
        public DateTime? DatePublished { get; set; }

    }
}
