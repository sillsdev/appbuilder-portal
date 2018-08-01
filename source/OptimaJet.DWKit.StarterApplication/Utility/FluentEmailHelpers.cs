using FluentEmail.Core.Models;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class FluentEmailHelpers
    {
        public static string AddressToString(Address address)
        {
            return (string.IsNullOrWhiteSpace(address.Name))
                ? address.EmailAddress
                : $"{address.Name} <{address.EmailAddress}>";
        }
    }
}
