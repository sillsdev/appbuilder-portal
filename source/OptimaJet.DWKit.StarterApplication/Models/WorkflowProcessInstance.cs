using System;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class WorkflowProcessInstance : Identifiable<Guid>
    {
        [Attr("state-name")]
        public string StateName { get; set; }

        [Attr("activity-name")]
        public string ActivityName { get; set; }

        [HasOne("Product")]
        public virtual Product Product { get; set; }
    }
}
