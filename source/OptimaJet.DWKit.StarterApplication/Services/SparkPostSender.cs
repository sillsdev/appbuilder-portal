using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentEmail.Core;
using FluentEmail.Core.Interfaces;
using FluentEmail.Core.Models;
using SparkPostDotNet;
using SparkPostDotNet.Transmissions;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class SparkPostSender : ISender
    {
        public SparkPostClient PostClient { get; }
        public SparkPostSender(SparkPostClient postClient)
        {
            PostClient = postClient;
        }


        public SendResponse Send(IFluentEmail email, CancellationToken? token = null)
        {
            return SendAsync(email, token).Result;
        }

        public async Task<SendResponse> SendAsync(IFluentEmail email, CancellationToken? token = null)
        {
            SendResponse response = new SendResponse();
            try
            {
                var tx = CreateTransmission(email);
                await PostClient.CreateTransmission(tx);
            }
            catch (Exception ex)
            {
                response.ErrorMessages.Add(ex.Message);
            }

            return response;
        }

        private Transmission CreateTransmission(IFluentEmail email)
        {
            var tx = new Transmission();
            tx.Content.Subject = email.Data.Subject;
            tx.Content.Html = email.Data.Body;
            tx.Content.Text = email.Data.PlaintextAlternativeBody;

            tx.Content.From.EMail = email.Data.FromAddress.EmailAddress;
            tx.Content.From.Name = email.Data.FromAddress.Name;

            email.Data.ToAddresses.ForEach((FluentEmail.Core.Models.Address obj) => AddRecipient(tx, obj));
            if (email.Data.CcAddresses.Count > 0) {
                string CC = string.Join(",", email.Data.ToAddresses.Select((arg) => arg.EmailAddress/*?? arg.ToString() ??*/).ToArray());
                tx.Content.Headers = new Dictionary<string, string> { { "CC", CC } };
            }
            var headerTo = email.Data.ToAddresses.First().EmailAddress;
            email.Data.CcAddresses.ForEach((FluentEmail.Core.Models.Address obj) => AddRecipient(tx, obj, headerTo));
            email.Data.BccAddresses.ForEach((FluentEmail.Core.Models.Address obj) => AddRecipient(tx, obj, headerTo));
            return tx;
        }

        private void AddRecipient(Transmission tx, FluentEmail.Core.Models.Address addr, string headerTo = null)
        {
            var r = new Recipient();
            r.Address.EMail = addr.EmailAddress;
            r.Address.Name = addr.Name;
            if (!string.IsNullOrWhiteSpace(headerTo)) r.Address.HeaderTo = headerTo;
            tx.Recipients.Add(r);
        }
    }
}
