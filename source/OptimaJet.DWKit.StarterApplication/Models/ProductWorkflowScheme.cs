using System;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProductWorkflowScheme : Identifiable<Guid>
    {
        public string SchemeCode { get; set; }

    }
}