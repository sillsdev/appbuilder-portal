using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Controllers.Attributes
{
  public class AuthorizeAnyAttribute : AuthorizeAttribute {

    public AuthorizeAnyAttribute(params RoleName[] roles) : base() {
      this.Policy = string.Join(",", roles);
      this.Roles = string.Join(",", roles);
    }
  }
}