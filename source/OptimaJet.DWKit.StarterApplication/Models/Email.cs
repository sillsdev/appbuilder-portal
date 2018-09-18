using System;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;
using Newtonsoft.Json;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class Email : Identifiable
    {
        [Attr("to")]
        public string To { get; set; }

        [Attr("cc")]
        public string Cc { get; set; }

        [Attr("bcc")]
        public string Bcc { get; set; }

        [Attr("subject")]
        public string Subject { get; set; }

        [Attr("content-template")]
        public string ContentTemplate { get; set; }

        [Attr("content-model"), NotMapped]
        public object ContentModel { get; set; }

        private const string EMPTY_JSON = "{}";
        public string ContentModelJson
        {
            get => (ContentModel == null)
                ? EMPTY_JSON
                : JsonConvert.SerializeObject(ContentModel);
            set => ContentModel = string.IsNullOrWhiteSpace(value)
                ? null
                : JsonConvert.DeserializeObject(value);
        }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public DateTime Created { get; set; } = DateTime.UtcNow;
    }
}
