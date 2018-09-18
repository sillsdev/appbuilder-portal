using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
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
