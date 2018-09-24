using System;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ApplicationType : Identifiable 
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("description")]
        public string Description { get; set; }
    }
}
