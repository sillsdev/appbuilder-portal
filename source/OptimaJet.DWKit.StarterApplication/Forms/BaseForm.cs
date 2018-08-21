using System;
using JsonApiDotNetCore.Internal;
namespace OptimaJet.DWKit.StarterApplication.Forms
{
    public class BaseForm
    {
        public ErrorCollection Errors { get; set; }
        public BaseForm()
        {
            Errors = new ErrorCollection();
        }
    }
}
