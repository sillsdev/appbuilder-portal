using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using FluentEmail.Core.Models;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class FluentEmailHelpers
    {
        public static string AddressToString(Address address) =>
            new MailAddress(address.EmailAddress, address.Name).ToString();

        public static string AddressesToString(List<Address> addresses) =>
           string.Join(",", addresses.Select((Address arg) => AddressToString(arg)));

        public static List<string> AddressesToStrings(List<Address> addresses) =>
            addresses.ConvertAll(address => AddressToString(address));
    }
}
