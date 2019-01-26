using System.Linq;
using System.Collections.Generic;
using JsonApiDotNetCore.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.Globalization;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class Reviewer : Identifiable
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("email")]
        public string Email { get; set; }

        [Attr("locale")]
        public string Locale { get; set; }

        [HasOne("project")]
        public virtual Project Project { get; set; }
        public int ProjectId { get; set; }

        public string LocaleOrDefault()
        {
            var locale = "en-US";
            if (!String.IsNullOrEmpty(Locale))
            {
                locale = Locale;
            }
            else if ((CultureInfo.CurrentCulture != null) && !String.IsNullOrEmpty(CultureInfo.CurrentCulture.Name))
            {
                locale = CultureInfo.CurrentCulture.Name;
            }
            return locale;
        }
    }
}
