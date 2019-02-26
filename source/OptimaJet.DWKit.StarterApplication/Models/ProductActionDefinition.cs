using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProductActionDefinition : Identifiable
    {
        [Attr("action-name")]
        public string ActionName { get; set; }

        [HasOne("product", Link.None)]
        public virtual ProductDefinition ProductDefinition { get; set; }
        public int ProductDefinitionId { get; set; }

        [HasOne("workflow-definition")]
        public virtual WorkflowDefinition Workflow { get; set; }
        public int WorkflowId { get; set; }
    }
}
