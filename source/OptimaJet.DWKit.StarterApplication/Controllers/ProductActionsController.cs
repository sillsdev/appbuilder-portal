using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ProductActionsController : Controller
    {
        public ProductActionsController(
            ProductService productService)
        {
            ProductService = productService;
        }

        public ProductService ProductService { get; }

        private async Task<Dictionary<string, List<string>>> DoGetProductActionsAsync(List<int> ids)
        {
            var productActions = await ProductService.GetProductActionsForProjectsAsync(ids);
            var result = new Dictionary<string, List<string>>();
            foreach (var item in productActions)
            {
                foreach (var type in item.Types)
                {
                    if (result.TryGetValue(type, out List<string> value))
                    {
                        value.Add(item.StringId);
                    }
                    else
                    {
                        result.Add(type, new List<string> { item.StringId });
                    }
                }
            }

            return result;
        }

        [Route("api/product-actions")]
        public async Task<Dictionary<string, List<string>>> GetProductActionsAsync([FromQuery] List<int> ids)
        {
            return await DoGetProductActionsAsync(ids);
        }

        //[Route("api/product-actions")]
        //[HttpPost]
        //public async Task<Dictionary<string, List<string>>> GetProductActionsFromBodyAsync([FromBody] List<int> ids)
        //{
        //    return await DoGetProductActionsAsync(ids);
        //}
    }
}
