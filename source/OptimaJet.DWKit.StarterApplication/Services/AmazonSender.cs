using System;
using System.Collections.Generic;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using FluentEmail.Core;
using FluentEmail.Core.Interfaces;
using FluentEmail.Core.Models;
using Microsoft.Extensions.Options;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class AmazonSender : ISender
    {
        private readonly IAmazonSimpleEmailService Client;

        public AmazonSender(IOptions<AmazonSenderOptions> options)
        {
            this.Client = new AmazonSimpleEmailServiceClient(options.Value.Credentials, options.Value.RegionEndpoint);
        }

        public SendResponse Send(IFluentEmail email, CancellationToken? token = null)
        {
            return SendAsync(email, token).Result;
        }

        public async Task<SendResponse> SendAsync(IFluentEmail email, CancellationToken? token = null)
        {
            var response = new SendResponse();
            try
            {
                var req = CreateRequest(email);
                await Client.SendEmailAsync(req);
            }
            catch (Exception ex)
            {
                response.ErrorMessages.Add(ex.Message);
            }

            return response;
        }
        private SendEmailRequest CreateRequest(IFluentEmail email)
        {
            return new SendEmailRequest
            {
                Message = new Message
                {
                    Subject = new Content(email.Data.Subject),
                    Body = new Body
                    {
                        Html = new Content { Charset = "UTF-8", Data = FormatText(email.Data.Body) },
                        Text = new Content { Charset = "UTF-8", Data = FormatText(email.Data.PlaintextAlternativeBody) }
                    },
                },
                Source = FormatAddress(email.Data.FromAddress),
                Destination = new Destination
                {
                    ToAddresses = FormatList(email.Data.ToAddresses),
                    CcAddresses = FormatList(email.Data.CcAddresses),
                    BccAddresses = FormatList(email.Data.BccAddresses)
                }
            };
        }

        public List<string> FormatList(List<Address> addresses) =>
            addresses.ConvertAll(address => FormatAddress(address));

        public string FormatAddress(Address address) =>
            new MailAddress(address.EmailAddress, address.Name).ToString();

        public string FormatText(string text) =>
            string.IsNullOrWhiteSpace(text) ? string.Empty : text;
    }
}
