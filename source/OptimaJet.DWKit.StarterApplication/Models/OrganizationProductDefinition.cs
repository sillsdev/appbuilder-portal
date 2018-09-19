using System;
using JsonApiDotNetCore.Models;
namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class OrganizationProductDefinition: Identifiable
    {
        [HasOne("organization")]
        public virtual Organization Organization { get; set; }
        public int OrganizationId { get; set; }

        [HasOne("product-definition")]
        public virtual ProductDefinition ProductDefinition { get; set; }
        public int ProductDefinitionId { get; set; }
    }
}
