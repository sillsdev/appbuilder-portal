using System;
namespace OptimaJet.DWKit.StarterApplication.Models
{
    public interface ITrackDate
    {
        DateTime? DateCreated { get; set; }
        DateTime? DateUpdated { get; set; }
    }
}
