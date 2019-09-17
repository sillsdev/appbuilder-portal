using System;
using System.ComponentModel.DataAnnotations;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class WorkflowScheme
    {
        [Key]
        public string Code { get; set; }
        public string Scheme { get; set; }
    }
}
