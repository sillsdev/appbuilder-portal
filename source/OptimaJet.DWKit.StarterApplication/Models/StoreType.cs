using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class StoreType : Identifiable
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("description")]
        public string Description { get; set; }

        [HasMany("languages")]
        public virtual List<StoreLanguage> Languages { get; set; }

        [NotMapped]
        public IEnumerable<int> LanguageIds => Languages?.Select(l => l.Id);
    }
}
