using System;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ApplicationType : Identifiable<string> 
    {
        [Attr("name")]
        public string Name { get; set; }
    }
}
