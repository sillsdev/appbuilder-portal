using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class Role : Identifiable {
        
        public RoleName RoleName { get; set; }

        [Attr("role-name")]
        public string RoleNameString {
            get {
                return RoleName.ToString();
            }
        }

        [HasMany("user-roles", Link.None)]
        public virtual List<UserRole> UserRoles { get; set; }
    }
}