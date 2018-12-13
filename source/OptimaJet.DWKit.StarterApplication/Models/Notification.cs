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

        [Attr("send-email")]
        public bool SendEmail { get; set; } = true;
    }
}
