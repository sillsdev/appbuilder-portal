using System;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProductTransition : Identifiable
    {
        [HasOne("product")]
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

        [Attr("comment")]
        public string Comment { get; set; }

        [Attr("transition-type")]
        public ProductTransitionType TransitionType { get; set; } = ProductTransitionType.Activity;

        [Attr("workflow-type")]
        public WorkflowType? WorkflowType { get; set; }

        [Attr("date-transition")]
        public DateTime? DateTransition { get; set; }

        [NotMapped]
        [Attr("date-started")]
        public DateTime? DateStarted { get; set; }
    }
}
