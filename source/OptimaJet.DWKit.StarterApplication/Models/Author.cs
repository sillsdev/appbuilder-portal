using System;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class Author : Identifiable
    {
        [HasOne("user")]
        public virtual User User { get; set; }
        public int UserId { get; set; }

        [HasOne("project")]
        public virtual Project Project { get; set; }
        public int ProjectId { get; set; }

        [Attr("can-update")]
        public bool? CanUpdate { get; set; } = false;
    }
}