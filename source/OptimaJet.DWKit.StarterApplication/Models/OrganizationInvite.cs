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

        [Attr("token")]
        public string Token { get; set; }
   }
}
