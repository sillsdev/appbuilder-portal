using System;
using System.Globalization;
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;
using OptimaJet.DWKit.StarterApplication.Utility;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ProductsController : BaseController<Product, Guid>
    {
        public ProductsController(
            IJsonApiContext jsonApiContext,
            ICurrentUserContext currentUserContext,
            WebRequestWrapper webRequestWrapper,
            OrganizationService organizationService,
            ProductService productService,
            UserService userService)
            : base(jsonApiContext, productService, currentUserContext, organizationService, userService)
        {
            WebRequestWrapper = webRequestWrapper;
            ProductService = productService;
        }

        public WebRequestWrapper WebRequestWrapper { get; }
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
                Actions = actions
            };
            return Ok(productActions);
        }

        [HttpPut("{id}/actions/{type}")]
        public async Task<IActionResult> RunProductAction(Guid id, String type)
        {
            var workflowDefinition = await ProductService.RunActionForProductAsync(id, type);
            if (workflowDefinition == null)
            {
                return NotFound();
            }

            return Ok(workflowDefinition);
        }
        [AllowAnonymous]
        [HttpGet("{id}/files/published/{type}")]
        public async Task<IActionResult> GetPublishedFile(Guid id, String type)
        {
            var productArtifact = await ProductService.GetPublishedFile(id, type);
            if (productArtifact == null)
            {
                return NotFound();
            }
            return Redirect(productArtifact.Url);
        }

        [AllowAnonymous]
        [HttpHead("{id}/files/published/{type}")]
        public async Task<IActionResult> CheckPublishedFile(Guid id, String type)
        {
            var ifModifiedSince = "";

            if (HttpContext.Request.Headers.ContainsKey("If-Modified-Since"))
            {
                ifModifiedSince = HttpContext.Request.Headers["If-Modified-Since"];
            }

            var productArtifact = await ProductService.GetPublishedFile(id, type);
            if (productArtifact == null)
            {
                return NotFound();
            }

            var updatedArtifact = WebRequestWrapper.GetFileInfo(productArtifact);
            HttpContext.Response.Headers.Add("Last-Modified", updatedArtifact.LastModified?.ToUniversalTime().ToString("r"));
            HttpContext.Response.Headers.Add("Content-Length", updatedArtifact.FileSize.ToString());

            var lastModified = updatedArtifact.LastModified?.ToUniversalTime().ToString("r");
            if (ifModifiedSince.CompareTo(lastModified) == 0)
            {
                return StatusCode(304);
            }

            return Ok();
        }

        [HttpGet("{id}/transitions")]
        public async Task<IActionResult> GetProductTransitions(Guid id)
        {
            var transitions = await ProductService.GetProductTransitionsForDisplayAsync(id);
            if (transitions == null)
            {
                return NotFound();
            }
            return Ok(transitions);
        }
        [HttpGet("{id}/transitions/active")]
        public async Task<IActionResult> GetActiveTransition(Guid id)
        {
            var transition = await ProductService.GetActiveTransitionAsync(id);
            if (transition == null)
            {
                return NotFound();
            }
            return Ok(transition);
        }
    }
}
