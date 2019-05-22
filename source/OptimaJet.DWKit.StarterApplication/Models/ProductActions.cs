using System;
using System.Collections.Generic;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProductActions : Identifiable<Guid>
    {
        [Attr("actions")]
        public List<string> Actions { get; set; }
    }

    public class ProductActionRuns : Identifiable<Guid>
    {
        [Attr("action")]
        public string Action { get; set; }

        [Attr("products")]
        public List<string> Products { get; set; }
    }

    public class ProductActionProjects : Identifiable<Guid>
    {
        [Attr("projects")]
        public List<int> Projects { get; set; }
    }
}
