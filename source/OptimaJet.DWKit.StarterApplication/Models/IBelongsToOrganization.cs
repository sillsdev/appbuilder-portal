namespace OptimaJet.DWKit.StarterApplication.Models
{
    public interface IBelongsToOrganization
    {
        int OrganizationId { get; set; }
        Organization Organization { get; set; }

    }
}
