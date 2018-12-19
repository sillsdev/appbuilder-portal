using System.Linq;
using JsonApiDotNetCore.Internal;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Middleware
{
    public class DisabledUserFilter : IActionFilter
    {
        private readonly CurrentUserRepository currentUserRepository;

        public DisabledUserFilter(CurrentUserRepository currentUserRepository)
        {
            this.currentUserRepository = currentUserRepository;
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            if (ActionAllowAnonymous(context)) return;

            if (HasJwtAuthentication(context) && IsUserLocked(context))
            {
                context.Result = UserLockedResult();
            }
        }

        protected bool ActionAllowAnonymous(ActionExecutingContext context)
        {
            var controllerActionDescriptor = context.ActionDescriptor as ControllerActionDescriptor;
            if (controllerActionDescriptor != null)
            {
                var actionAttributes = controllerActionDescriptor.MethodInfo.GetCustomAttributes(inherit: true);
                var attr = actionAttributes
                    .Where(a => a.GetType().IsAssignableFrom(typeof(AllowAnonymousAttribute)))
                    .FirstOrDefault();
                return (attr != null);
            }

            return false;
        }

        protected bool HasJwtAuthentication(ActionExecutingContext context)
        {
            bool retval = false;
            if (context.Controller.GetType().IsDefined(typeof(AuthorizeAttribute), true))
            {
                var attr = (AuthorizeAttribute)context.Controller.GetType()
                    .GetCustomAttributes(true)
                    .FirstOrDefault(a => a.GetType().IsAssignableFrom(typeof(AuthorizeAttribute)));

                //DefaultPolicy on authorization included JWT, so if this is the default AuthorizeAttribute, then jwt is included.
                retval = (attr.IsDefaultAuthorizeAttribute() || attr.AuthenticationSchemes.Contains(JwtBearerDefaults.AuthenticationScheme));
            }
            return retval;
        }

        protected bool IsUserLocked(ActionExecutingContext context)
        {
            var user = currentUserRepository.GetCurrentUser().Result;
            return user != null && user.IsLocked;
        }

        protected IActionResult UserLockedResult()
        {
            var errors = new ErrorCollection();
            errors.Add(new Error(403, "User is Locked"));
            return new ContentResult()
            {
                StatusCode = StatusCodes.Status403Forbidden,
                Content = errors.GetJson()
            };
        }
    }

    public static class AuthorizeAttributeExtensions
    {
        public static bool IsDefaultAuthorizeAttribute(this AuthorizeAttribute attr)
        {
            return attr.AuthenticationSchemes == null &&
                attr.Policy == null &&
                attr.Roles == null;
        }
    }
}
