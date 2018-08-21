using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class ProjectService: EntityResourceService<Project>
    {
        Forms.Projects.CreateForm CreateForm;
        Forms.Projects.UpdateForm UpdateForm;

        public ProjectService(
            IJsonApiContext jsonApiContext,
            IEntityRepository<Project> projectRepository,
            Forms.Projects.CreateForm createForm,
            Forms.Projects.UpdateForm updateForm,
            ILoggerFactory loggerFactory) : base(jsonApiContext, projectRepository, loggerFactory)
        {
            this.CreateForm = createForm;
            this.UpdateForm = updateForm;
        }
        public override async Task<Project> CreateAsync(Project resource)
        {
            if (!CreateForm.IsValid(resource)){
                throw new JsonApiException(CreateForm.Errors);
            }
            return await base.CreateAsync(resource);
        }

        public override async Task<Project> UpdateAsync(int id, Project resource)
        {
            if (!UpdateForm.IsValid(id, resource)){
                throw new JsonApiException(UpdateForm.Errors);
            }
            return await base.UpdateAsync(id, resource);
        }


    }
}
