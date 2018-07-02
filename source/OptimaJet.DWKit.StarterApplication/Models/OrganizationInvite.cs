using System;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
    [Table("OrganizationInvite")]
    public class OrganizationInvite : Identifiable
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("ownerEmail")]
        public string OwnerEmail { get; set; }

        [Attr("token",isImmutable:true)]
        public string Token { get; set; }
   }
}
