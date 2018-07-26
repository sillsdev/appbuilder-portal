using System;
namespace OptimaJet.DWKit.StarterApplication.Services
{
    public interface IOrganizationContext
    {
        bool HasOrganization { get; }
        bool SpecifiedOrganizationDoesNotExist { get; }
        int OrganizationId { get; }
    }
}
