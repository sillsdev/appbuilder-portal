using System.Linq;
using System.Collections.Generic;
using JsonApiDotNetCore.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class OrganizationMembershipInvite : Identifiable, ITrackDate
    {

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        [Attr("token")]
        public Guid? Token { get; set; }

        [Attr("email")]
        public string Email { get; set; }

        [Attr("expires")]
        public DateTime Expires { get; set; }

        [HasOne("invited-by", withForeignKey: nameof(InvitedById))]
        public virtual User InvitedBy { get; set; }

        [Attr("invited-by-id")]
        public int InvitedById { get; set; }

        [HasOne("organization")]
        public virtual Organization Organization { get; set; }

        [Attr("organization-id")]
        public int OrganizationId { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }

        [HasOne("organization-membership")]
        public virtual OrganizationMembership OrganizationMembership { get; set; }

        [Attr("organization-membership-id")]
        public int? OrganizationMembershipId { get; set; }
    }
}
