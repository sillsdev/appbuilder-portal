using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SIL.AppBuilder.Portal.Backend.Controllers
{

    [Authorize]
    public class StarterApplicationController : Controller
    {
        // GET: /<controller>/
      
        public IActionResult Index()
        {
            return View();
        }
    }
}
