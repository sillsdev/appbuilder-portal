using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;
namespace OptimaJet.DWKit.StarterApplication.Forms
{
    public class ProductUserChangeForm : BaseForm
    {
        public IEntityRepository<Product, Guid> ProductRepository { get; }
        public ProductUserChangeForm(
            UserRepository userRepository,
            IEntityRepository<UserRole> userRolesRepository,
            ICurrentUserContext currentUserContext,
            IEntityRepository<Product, Guid> productRepository)
            : base(userRepository, userRolesRepository, currentUserContext)
        {
            ProductRepository = productRepository;
        }

        public bool IsValid(ProductUserChange productUserChange)
        {
            if (productUserChange.ProductId != null)
            {
                var product = ProductRepository.Get()
                    .Where(p => p.Id.Equals(productUserChange.ProductId))
                    .FirstOrDefaultAsync().Result;
                if (product == null)
                {
                    var message = $"Product {productUserChange.ProductId} not found";
                    AddError(message);
                }
            }

            return base.IsValid();
        }
    }
}
