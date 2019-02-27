﻿using System;
using System.Collections.Generic;
using JsonApiDotNetCore.Models;

namespace OptimaJet.DWKit.StarterApplication.Models
{
    public class Product : Identifiable<Guid>, ITrackDate
    {
        [HasOne("project")]
        public virtual Project Project { get; set; }
        public int ProjectId { get; set; }

        [HasOne("product-definition")]
        public virtual ProductDefinition ProductDefinition { get; set; }
        public int ProductDefinitionId { get; set; }

        [HasOne("store")]
        public virtual Store Store { get; set; }
        public int? StoreId { get; set; }

        [HasMany("user-tasks", Link.None)]
        public virtual List<UserTask> UserTasks { get; set; }

        public virtual ProductWorkflow ProductWorkflow { get; set; }

        public virtual List<ProductTransition> Transitions { get; set; }

        [HasOne("store-language")]
        public virtual StoreLanguage StoreLanguage { get; set; }
        public int? StoreLanguageId { get; set; }

        [Attr("date-created")]
        public DateTime? DateCreated { get; set; }

        [Attr("date-updated")]
        public DateTime? DateUpdated { get; set; }

        [Attr("workflow-job-id")]
        public int WorkflowJobId { get; set; }

        [Attr("workflow-build-id")]
        public int WorkflowBuildId { get; set; }

        [Attr("date-built")]
        public DateTime? DateBuilt { get; set; }

        [Attr("workflow-publish-id")]
        public int WorkflowPublishId { get; set; }

        [Attr("workflow-comment")]
        public string WorkflowComment { get; set; }

        [Attr("date-published")]
        public DateTime? DatePublished { get; set; }

        [Attr("publish-link")]
        public String PublishLink { get; set; }

        [HasMany("product-builds", Link.None)]
        public virtual List<ProductBuild> ProductBuilds { get; set; }
    }
}
