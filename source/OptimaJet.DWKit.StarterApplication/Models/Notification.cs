using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class Notification : Identifiable, ITrackDate
    {
        [Attr("message-id")]
        public String MessageId { get; set; }

        [HasOne("user", Link.None)]
        public virtual User User { get; set; }

        public int UserId { get; set; }

        [Attr("date-read")]
        public DateTime? DateRead { get; set; }

        [Attr("date-email-sent")]
        public DateTime? DateEmailSent { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }

        [Attr("message")]
        public String Message { get; set; }

        [Attr("message-substitutions"), NotMapped]
        public object MessageSubstitutions { get; set; }

        private const string EMPTY_JSON = "{}";
        public string MessageSubstitutionsJson
        {
            get => (MessageSubstitutions == null)
                ? EMPTY_JSON
                : JsonConvert.SerializeObject(MessageSubstitutions);
            set => MessageSubstitutions = string.IsNullOrWhiteSpace(value)
                ? new Dictionary<string, object>()
                : JObject.Parse(value).ToObject<Dictionary<string, object>>();
        }

        [Attr("send-email")]
        public bool SendEmail { get; set; } = true;

        [Attr("link-url")]
        public string LinkUrl { get; set; }
    }
}
