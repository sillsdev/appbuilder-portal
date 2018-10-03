using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class Project : Identifiable, ITrackDate, IBelongsToOrganization
    {
        [Attr("name")]
        public string Name { get; set; }

        [HasOne("type")]
        public virtual ApplicationType Type { get; set; }

        [Attr("type-id")]
        public int TypeId { get; set; }

        [Attr("description")]
        public string Description { get; set; }

        [HasOne("owner")]
        public virtual User Owner { get; set; }
        [Attr("owner-id")]
        public int OwnerId { get; set; }

        [HasOne("group")]
        public virtual Group Group { get; set; }
        public int GroupId { get; set; }

        [HasOne("organization")]
        public virtual Organization Organization { get; set; }
        public int OrganizationId { get; set; }

        [Attr("language")]
        public string Language { get; set; }

        [Attr("is-public")]
        public bool IsPublic { get; set; } = true;

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }

        [Attr("date-archived")]
        public DateTime? DateArchived { get; set; }

        [HasMany("reviewers", Link.None)]
        public virtual List<Reviewer> Reviewers { get; set; }

        [Attr("allow-downloads")]
        public bool AllowDownloads { get; set; } = true;

        [Attr("automatic-builds")]
        public bool AutomaticBuilds { get; set; } = true;

        [Attr("workflow-project-id")]
        public int WorkflowProjectId { get; set; }

        [Attr("workflow-project-url")]
        public String WorkflowProjectUrl { get; set; }

        [HasMany("products", Link.None)]
        public virtual List<Product> Products { get; set; }
    }
}
