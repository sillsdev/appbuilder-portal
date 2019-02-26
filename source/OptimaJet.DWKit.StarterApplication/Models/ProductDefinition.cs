using System.Collections.Generic;
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

        [HasMany("actions", Link.None)]
        public virtual List<ProductActionDefinition> Actions { get; set; }
    }
}
