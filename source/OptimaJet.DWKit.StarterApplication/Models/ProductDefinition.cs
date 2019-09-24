using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProductDefinition : Identifiable
    {
        [Attr("name")]
        public string Name { get; set; }

        [HasOne("type")]
        public virtual ApplicationType Type { get; set; }
        public int TypeId { get; set; }

        [Attr("description")]
        public string Description { get; set; }

        [HasOne("workflow")]
        public virtual WorkflowDefinition Workflow { get; set; }
        public int WorkflowId { get; set; }

        [HasOne("rebuild-workflow")]
        public virtual WorkflowDefinition RebuildWorkflow { get; set; }
        public int?  RebuildWorkflowId { get; set; }

        [HasOne("republish-workflow")]
        public virtual WorkflowDefinition RepublishWorkflow { get; set; }
        public int? RepublishWorkflowId { get; set; }

        [Attr("properties")]
        public string Properties { get; set; }
    }
}
