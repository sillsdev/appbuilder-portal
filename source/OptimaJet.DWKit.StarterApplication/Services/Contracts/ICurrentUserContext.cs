using System;
using Optimajet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public interface ICurrentUserContext
    {
        string Auth0Id { get; }
    }
}
