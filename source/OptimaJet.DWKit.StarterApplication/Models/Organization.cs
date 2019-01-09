using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using JsonApiDotNetCore.Models;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class Organization : Identifiable, IBuildEngineReference
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("website-url")]
        public string WebsiteUrl { get; set; }

        [Attr("build-engine-url")]
        public string BuildEngineUrl { get; set; }

        [Attr("build-engine-api-access-token")]
        public string BuildEngineApiAccessToken { get; set; }

        [Attr("logo-url")]
        public string LogoUrl { get; set; }

        [Attr("use-default-build-engine")]
        public bool? UseDefaultBuildEngine { get; set; } = true;

        [Attr("public-by-default")]
        public bool? PublicByDefault { get; set; } = true;

        [HasOne("owner")]
        public virtual User Owner { get; set; }
        public int OwnerId { get; set; }

        [HasMany("organization-memberships", Link.None)]
        public virtual List<OrganizationMembership> OrganizationMemberships { get; set; }

        [HasMany("groups")]
        public virtual List<Group> Groups { get; set; }

        [HasMany("organization-product-definitions", Link.None)]
        public virtual List<OrganizationProductDefinition> OrganizationProductDefinitions { get; set;}

        [HasMany("organization-stores", Link.None)]
        public virtual List<OrganizationStore> OrganizationStores { get; set; }

        [HasMany("user-roles", Link.None)]
        public virtual List<UserRole> UserRoles { get; set; }

        [NotMapped]
        public IEnumerable<int> ProductDefinitionIds => OrganizationProductDefinitions?.Select(pd => pd.ProductDefinitionId);

        [NotMapped]
        public IEnumerable<int> StoreIds => OrganizationStores?.Select(s => s.StoreId);
    }
}
