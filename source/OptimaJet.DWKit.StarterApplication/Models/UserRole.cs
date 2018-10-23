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

    public RoleName RoleName { get; set; }
  }
}