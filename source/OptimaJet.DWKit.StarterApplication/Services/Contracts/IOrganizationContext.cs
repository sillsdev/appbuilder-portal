using System;
namespace OptimaJet.DWKit.StarterApplication.Services
{
    public interface IOrganizationContext
    {
        bool HasOrganization { get; }
        bool InvalidOrganization { get; }
        int OrganizationId { get; }
    }
}
