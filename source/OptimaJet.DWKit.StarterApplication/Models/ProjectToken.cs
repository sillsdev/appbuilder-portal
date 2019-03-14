using System;
using JsonApiDotNetCore.Models;
namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class ProjectToken : Identifiable
    {
        [Attr("session-token")]
        public String SessionToken { get; set; }
        [Attr("secret-access-key")]
        public String SecretAccessKey { get; set; }
        [Attr("access-key-id")]
        public String AccessKeyId { get; set; }
        [Attr("expiration")]
        public String Expiration { get; set; }
        [Attr("url")]
        public String Url { get; set; }
    }
}
