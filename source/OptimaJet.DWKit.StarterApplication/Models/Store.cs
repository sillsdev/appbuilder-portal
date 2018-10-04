using System.Collections.Generic;
using JsonApiDotNetCore.Models;
namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class Store : Identifiable
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("description")]
        public string Description { get; set; }

        [HasOne("store-type")]
        public virtual StoreType StoreType { get; set; }
        public int StoreTypeId { get; set; }

        [HasMany("oranization-stores")]
        public virtual List<OrganizationStore> OrganizationStores { get; set; }
    }
}
