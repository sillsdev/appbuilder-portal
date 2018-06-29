using System;
using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
    public class OrganizationUser : Identifiable
    {
        public int OrganizationId { get; set; }
        public Organization Organization { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }
    }
}
