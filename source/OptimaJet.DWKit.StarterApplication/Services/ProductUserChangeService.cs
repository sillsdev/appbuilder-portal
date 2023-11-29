using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.StarterApplication.Forms;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class ProductUserChangeService : EntityResourceService<ProductUserChange>
    {
        public IJsonApiContext JsonApiContext { get; }
        public UserRepository UserRepository { get; }
        public ICurrentUserContext CurrentUserContext { get; }
        public IEntityRepository<UserRole> UserRolesRepository { get; }
        public IEntityRepository<ProductUserChange> ProductUserChangeRepository { get; }
        public IEntityRepository<Product, Guid> ProductRepository { get; }

        public ProductUserChangeService(
            IJsonApiContext jsonApiContext,
            UserRepository userRepository,
            ICurrentUserContext currentUserContext,
            IEntityRepository<UserRole> userRolesRepository,
            IEntityRepository<ProductUserChange> productUserChangeRepository,
            IEntityRepository<Product, Guid> productRepository,
            ILoggerFactory loggerFactory) : base(jsonApiContext, productUserChangeRepository, loggerFactory)
        {
            JsonApiContext = jsonApiContext;
            ProductUserChangeRepository = productUserChangeRepository;
            ProductRepository = productRepository;
            UserRolesRepository = userRolesRepository;
            UserRepository = userRepository;
            CurrentUserContext = currentUserContext;
        }

        public override async Task<ProductUserChange> CreateAsync(ProductUserChange resource)
        {
            var form = new ProductUserChangeForm(UserRepository,
                                            UserRolesRepository,
                                            CurrentUserContext,
                                            ProductRepository);
            if (!form.IsValid(resource))
            {
                throw new JsonApiException(form.Errors);
            }
            return await base.CreateAsync(resource);
        }
    }
}
