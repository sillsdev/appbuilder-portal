using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class Group : Identifiable
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("abbreviation")]
        public string Abbreviation { get; set; }

        [HasOne("owner")]
        public virtual Organization Owner { get; set; }
        public int OwnerId { get; set; }
    }
}

