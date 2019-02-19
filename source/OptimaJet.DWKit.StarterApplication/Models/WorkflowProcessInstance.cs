using System;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class WorkflowProcessInstance : Identifiable<Guid>
    {
        public string StateName { get; set; }

        public string ActivityName { get; set; }

        public virtual Product Product { get; set; }
    }
}
