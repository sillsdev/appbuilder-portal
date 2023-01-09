 using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
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
            IWebClient webClient,
            OrganizationService organizationService,
            ProductService productService,
            UserService userService)
            : base(jsonApiContext, productService, currentUserContext, organizationService, userService)
        {
            WebRequestWrapper = webRequestWrapper;
            WebClient = webClient;
            ProductService = productService;
        }

        public WebRequestWrapper WebRequestWrapper { get; }
        public IWebClient WebClient { get; }
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

        class ManifestResponse
        {
            public string url;
            public string icon;
            public string color;
            [JsonProperty("default-language")]
            public string defaultLanguage;
            [JsonProperty("download-apk-strings")]
            public Dictionary<string, string> downloadApkStrings;
            public List<string> languages;
            public List<string> files;
        }

        [AllowAnonymous]
        [HttpGet("{package}/published")]
        public async Task<IActionResult> GetPublishedAppDetails(string package)
        {
            // Get the play-listing/manifest.json artifact
            var manifestArtifact = await ProductService.GetPublishedAppDetails(package);
            if (manifestArtifact == null)
            {
                return NotFound();
            }

            // Get the size of the apk
            var apkArtifact = await ProductService.GetPublishedFile(manifestArtifact.ProductId, "apk");
            if (apkArtifact == null)
            {
                return NotFound();
            }
            var updatedApkArtifact = WebRequestWrapper.GetFileInfo(apkArtifact);

            // Get the contents of the manifest.json
            var manifestJson = await WebClient.DownloadStringTaskAsync(manifestArtifact.Url);

            var manifest = JsonConvert.DeserializeObject<ManifestResponse>(manifestJson);
            var url = manifest.url;
            var titles = new Dictionary<string,string>(manifest.languages.Count);
            var descriptions = new Dictionary<string,string>(manifest.languages.Count);
            foreach(string language in manifest.languages)
            {
                var title = "";
                var titleSearch = $"{language}/title.txt";
                var titlePath = manifest.files.Where(s => s.Contains(titleSearch)).FirstOrDefault();
                if (!string.IsNullOrEmpty(titlePath)) { title = await WebClient.DownloadStringTaskAsync(url + titlePath); }
                titles.Add(language, title.Trim());

                var description = "";
                var descriptionSearch = $"{language}/short_description.txt";
                var descriptionPath = manifest.files.Where(s => s.Contains(descriptionSearch)).FirstOrDefault();
                if (!string.IsNullOrEmpty(descriptionPath)) { description = await WebClient.DownloadStringTaskAsync(url + descriptionPath); }
                descriptions.Add(language, description);
            }

            var details = new AppDetails
            {
                Id = manifestArtifact.ProductId,
                Link = $"/api/products/{manifestArtifact.ProductId}/files/published/apk",
                Size = updatedApkArtifact.FileSize.Value,
                DefaultLanguage = manifest.defaultLanguage,
                Color = manifest.color,
                Icon = url + manifest.icon,
                Languages = manifest.languages,
                Titles = titles,
                Descriptions = descriptions,
                DownloadApkStrings = manifest.downloadApkStrings
            };

            return Ok(details);
        }

        [HttpGet("{id}/builds")]
        public async Task<IActionResult> GetProductBuilds(Guid id)
        {
            var builds = await ProductService.GetProductBuildsAsync(id);
            if (builds == null)
            {
                return NotFound();
            }
            return Ok(builds);
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
