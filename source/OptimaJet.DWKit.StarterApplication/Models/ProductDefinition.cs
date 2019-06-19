using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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

        [Attr("parameters"), NotMapped]
        public object Parameters { get; set; }

        private const string EMPTY_JSON = "{}";
        public string ParametersJson
        {
            get => (Parameters == null)
                ? EMPTY_JSON
                : JsonConvert.SerializeObject(Parameters);
            set => Parameters = string.IsNullOrWhiteSpace(value)
                ? new Dictionary<string, object>()
                : JObject.Parse(value).ToObject<Dictionary<string, object>>();
        }
    }
}
