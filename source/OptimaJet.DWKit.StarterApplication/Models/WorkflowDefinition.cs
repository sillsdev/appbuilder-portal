using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
    public class WorkflowDefinition : Identifiable
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("enabled")]
        public bool Enabled { get; set; }

        [Attr("description")]
        public string Description { get; set; }

        [Attr("workflow-scheme")]
        public string WorkflowScheme { get; set; }
    }
}
