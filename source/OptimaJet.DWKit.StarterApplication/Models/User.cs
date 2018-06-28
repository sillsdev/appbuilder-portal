using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;

namespace Optimajet.DWKit.StarterApplication.Models
{
    [Table("User")]
    public class User : Identifiable
    {
        [Attr("name")]
        public string Name { get; set; }

        [Attr("email")]
        public string Email { get; set; }

        [Attr("auth0Id")]
        public string ExternalId { get; set; }

        //[HasMany("ownedOrganizations")]
        //public virtual List<Organization> OwnedOrganizations { get; set; }

        //[HasMany("organizations")]
        //public virtual List<Organization> Organizations { get; set; }
    }
}
