using System;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public interface ICurrentUserContext
    {
        string Auth0Id { get; }
        string Email { get; }
        string GivenName { get; }
        string FamilyName { get; }
        string Name { get; }
    }
}
