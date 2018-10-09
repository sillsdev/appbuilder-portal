using System;
using JsonApiDotNetCore.Models;
namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class OrganizationStore : Identifiable
    {
        [HasOne("organization")]
        public virtual Organization Organization { get; set; }
        public int OrganizationId { get; set; }

        [HasOne("store")]
        public virtual Store Store { get; set; }
        public int StoreId { get; set; }
    }
}
