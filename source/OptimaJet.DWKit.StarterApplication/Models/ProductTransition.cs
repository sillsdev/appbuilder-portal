using System;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProductTransitionHistory : Identifiable
    {
        [HasOne("project")]
        public virtual Product Product { get; set; }
        public Guid ProductId { get; set; }

        [Attr("workflow-user-id")]
        public Guid? WorkflowUserId { get; set; }

        [Attr("allowed-user-names")]
        public string AllowedUserNames { get; set; }

        [Attr("initial-state")]
        public string InitialState { get; set; }

        [Attr("destination-state")]
        public string DestinationState { get; set; }

        [Attr("command")]
        public string Command { get; set; }

        [Attr("date-transition")]
        public DateTime? DateTransition { get; set; }

    }
}
