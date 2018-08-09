using System;
namespace Optimajet.DWKit.StarterApplication.Models
{
    public interface ITrackDate
    {
        DateTime? DateCreated { get; set; }
        DateTime? DateUpdated { get; set; }
    }
}
