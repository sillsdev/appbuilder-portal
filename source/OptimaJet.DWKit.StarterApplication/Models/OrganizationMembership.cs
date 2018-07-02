using System;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
    [Table("OrganizationMembership")]
    public class OrganizationMembership :Identifiable<Guid>
    {
        [HasOne("user")]
        public virtual User User { get; set; }
        public int UserId { get; set; }

        [HasOne("Organization")]
        public virtual Organization Organization { get; set; }
        public int OrganizationId { get; set; }
    }
}
