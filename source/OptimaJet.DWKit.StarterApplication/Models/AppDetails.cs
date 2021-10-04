using System;
using System.Collections.Generic;
using JsonApiDotNetCore.Models;
namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class AppDetails : Identifiable<Guid>
    {
        [Attr("link")]
        public string Link { get; set; }

        [Attr("size")]
        public Int64 Size { get; set; }

        [Attr("icon")]
        public string Icon { get; set; }

        [Attr("color")]
        public string Color { get; set; }

        [Attr("default-language")]
        public string DefaultLanguage { get; set; }

        [Attr("languages")]
        public List<string> Languages { get; set; }

        [Attr("titles")]
        public Dictionary<string, string> Titles { get; set; }

        [Attr("descriptions")]
        public Dictionary<string, string> Descriptions { get; set; }
    }
}
