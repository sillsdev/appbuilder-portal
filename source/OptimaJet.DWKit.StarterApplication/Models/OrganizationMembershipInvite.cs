using System.Linq;
using System.Collections.Generic;
using JsonApiDotNetCore.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.ComponentModel.DataAnnotations;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class OrganizationMembershipInvite : Identifiable, ITrackDate
    {
        [Attr("token")]
        public Guid? Token { get; set; }

        [Required]
        [Attr("email")]
        public string Email { get; set; }

        [Attr("expires")]
        public DateTime Expires { get; set; }

        [Attr("redeemed")]
        public Boolean Redeemed { get; set; }

        [HasOne("invited-by", withForeignKey: nameof(InvitedById))]
        public virtual User InvitedBy { get; set; }


        [Attr("invited-by-id")]
        public int InvitedById { get; set; }


        [HasOne("organization")]
        public virtual Organization Organization { get; set; }

        [Required]
        [Attr("organization-id")]
        public int OrganizationId { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }
    }
}
