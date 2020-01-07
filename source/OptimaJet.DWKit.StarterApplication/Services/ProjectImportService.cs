using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Forms.Projects;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class ProjectImportService : EntityResourceService<ProjectImport>
    {
        public IJsonApiContext JsonApiContext { get; }
        public UserRepository UserRepository { get; }
        public GroupRepository GroupRepository { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public IEntityRepository<Organization> OrganizationRepository { get; }
        public IEntityRepository<UserRole> UserRolesRepository { get; }
        public IEntityRepository<ProductDefinition> ProductDefinitionRepository { get; }
        public IEntityRepository<Store> StoreRepository { get; }
        public IEntityRepository<ProjectImport> ProjectImportRepository { get; }

        public ProjectImportService(
            IJsonApiContext jsonApiContext,
            UserRepository userRepository,
            GroupRepository groupRepository,
            ICurrentUserContext currentUserContext,
            IEntityRepository<Organization> organizationRepository,
            IEntityRepository<UserRole> userRolesRepository,
            IEntityRepository<ProductDefinition> productDefinitionRepository,
            IEntityRepository<Store> storeRepository,
            IEntityRepository<ProjectImport> projectImportRepository,
            ILoggerFactory loggerFactory) : base(jsonApiContext, projectImportRepository, loggerFactory)
        {
            JsonApiContext = jsonApiContext;
            UserRepository = userRepository;
            GroupRepository = groupRepository;
            CurrentUserContext = currentUserContext;
            OrganizationRepository = organizationRepository;
            UserRolesRepository = userRolesRepository;
            ProductDefinitionRepository = productDefinitionRepository;
            StoreRepository = storeRepository;
            ProjectImportRepository = projectImportRepository;
        }

        public override async Task<ProjectImport> CreateAsync(ProjectImport resource)
        {
            var importForm = new ImportForm(UserRepository,
                                            GroupRepository,
                                            CurrentUserContext,
                                            UserRolesRepository,
                                            OrganizationRepository,
                                            ProductDefinitionRepository,
                                            StoreRepository);
            if (! await importForm.IsValid(resource))
            {
                throw new JsonApiException(importForm.Errors);
            }
            return await base.CreateAsync(resource);
        }
    }
}
