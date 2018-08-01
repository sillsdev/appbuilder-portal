using System;
namespace OptimaJet.DWKit.StarterApplication.Services
{
    public interface IOrganizationInviteRequestService
    {
        void Process(OrganizationInviteRequestServiceData data);
    }

    public class OrganizationInviteRequestServiceData
    {
        public int Id { get; set; }
    }
}
