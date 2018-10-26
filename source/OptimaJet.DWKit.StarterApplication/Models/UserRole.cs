using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
  public class UserRole : Identifiable
  {
    [HasOne("user", Link.None)]
    public virtual User User { get; set; }

    public int UserId { get; set; }

    [HasOne("role", Link.None)]
    public virtual Role Role { get; set; }

    public int RoleId { get; set; }

    [HasOne("organization", Link.None)]
    public virtual Organization Organization { get; set; }
    public int OrganizationId { get; set; }

    [NotMapped]
    public RoleName RoleName { 
      get { return Role.RoleName; }
    }
  }
}