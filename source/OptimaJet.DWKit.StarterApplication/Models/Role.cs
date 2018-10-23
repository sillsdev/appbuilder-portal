using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class Role : Identifiable {
        
        [Key]
        public RoleName RoleName { get; set; }

        [HasMany("user-roles", Link.None)]
        public virtual List<UserRole> UserRoles { get; set; }
    }
}