using System;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProductWorkflowScheme : Identifiable<Guid>
    {
        public string SchemeCode { get; set; }
        public string Scheme { get; set; }
        public bool IsObsolete { get; set; }
    }
}