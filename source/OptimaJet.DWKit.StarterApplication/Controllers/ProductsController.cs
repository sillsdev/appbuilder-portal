using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ProductsController : BaseController<Product, Guid>
    {
        public ProductsController(
            IJsonApiContext jsonApiContext,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService,
            ProductService productService,
            UserService userService)
            : base(jsonApiContext, productService, currentUserContext, organizationService, userService)
        {
            ProductService = productService;
        }

        public ProductService ProductService { get; }

        [HttpGet("{id}/actions")]
        public async Task<IActionResult> GetProductActions(Guid id)
        {
            var actions = await ProductService.GetProductActionsAsync(id);
            if (actions == null)
            {
                return NotFound();
            }

            var productActions = new ProductActions
            {
                Id = id,
                Types = actions
            };
            return Ok(productActions);
        }

        [HttpPut("{id}/actions/{type}")]
        public async Task<IActionResult> RunProductAction(Guid id, String type)
        {
            var workflowDefinition = await ProductService.RunProductActionAsync(id, type);
            if (workflowDefinition == null)
            {
                return NotFound();
            }

            return Ok(workflowDefinition);
        }
    }
}
