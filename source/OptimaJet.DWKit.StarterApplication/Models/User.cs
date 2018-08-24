    using System.Linq;
using System.Collections.Generic;
using JsonApiDotNetCore.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Optimajet.DWKit.StarterApplication.Models
{
    public class User : Identifiable
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("given-name")]
        public string GivenName { get; set; }

        [Attr("family-name")]
        public string FamilyName { get; set; }

        [Attr("email")]
        public string Email { get; set; }

        [Attr("phone")]
        public string Phone { get; set; }

        [Attr("timezone")]
        public string Timezone { get; set; }

        [Attr("locale")]
        public string Locale { get; set; }

        [Attr("is-locked")]
        public bool IsLocked { get; set; }

        [Attr("auth0Id")]
        public string ExternalId { get; set; }

        [Attr("profile-visibility")]
        public ProfileVisibility ProfileVisibility { get; set; }

        [Attr("email-notification")]
        public bool EmailNotification { get; set; }

        //[HasMany("ownedOrganizations")]
        //public virtual List<Organization> OwnedOrganizations { get; set; }

        [HasMany("organization-memberships", Link.None)]
        public virtual List<OrganizationMembership> OrganizationMemberships { get; set; }

        [HasMany("group-memberships", Link.None)]
        public virtual List<GroupMembership> GroupMemberships { get; set; }

        [NotMapped]
        public IEnumerable<int> OrganizationIds => OrganizationMemberships?.Select(o => o.OrganizationId);
    }
}
