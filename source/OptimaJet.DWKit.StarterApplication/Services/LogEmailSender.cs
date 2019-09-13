using System.Text;
using System.Threading;
using System.Threading.Tasks;
using FluentEmail.Core;
using FluentEmail.Core.Interfaces;
using FluentEmail.Core.Models;
using static OptimaJet.DWKit.StarterApplication.Utility.FluentEmailHelpers;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class LogEmailSender : ISender
    {
        public SendResponse Send(IFluentEmail email, CancellationToken? token = null)
        {
            return SendAsync(email, token).Result;
        }

        public async Task<SendResponse> SendAsync(IFluentEmail email, CancellationToken? token = null)
        {
            var response = new SendResponse();
            StringBuilder builder = new StringBuilder();
            builder
                .AppendLine("====================== EMAIL ======================")
                .AppendLine($"From: {AddressToString(email.Data.FromAddress)}")
                .AppendLine($"To: {AddressesToString(email.Data.ToAddresses)}");
            var CC = AddressesToString(email.Data.CcAddresses);
            if (!string.IsNullOrWhiteSpace(CC)) builder.AppendLine($"CC: {CC}");
            var BCC = AddressesToString(email.Data.BccAddresses);
            if (!string.IsNullOrWhiteSpace(BCC)) builder.AppendLine($"BCC: {BCC}");
            builder
                .AppendLine($"Subject: {email.Data.Subject}")
                .AppendLine($"Body:")
                .AppendLine(email.Data.Body)
                .AppendLine($"PlainTextBody:")
                .AppendLine(email.Data.PlaintextAlternativeBody)
                .AppendLine("---------------------- EMAIL ----------------------");

            Log.Information(builder.ToString());
            await Task.CompletedTask;
            return response;
        }
    }
}
