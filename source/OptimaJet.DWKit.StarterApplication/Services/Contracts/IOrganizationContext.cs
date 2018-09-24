using System;
namespace OptimaJet.DWKit.StarterApplication.Services
{
    public interface IOrganizationContext
    {
        bool HasOrganization { get; }
        bool SpecifiedOrganizationDoesNotExist { get; }
        bool IsOrganizationHeaderPresent { get; }
        int OrganizationId { get; }
    }
}
