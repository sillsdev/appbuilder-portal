using System;
namespace OptimaJet.DWKit.StarterApplication.Services
{
    public interface IEmailService
    {
        void Process(EmailServiceData data);
    }

    public class EmailServiceData
    {
        public EmailServiceData() 
        {
            AttemptCount = 1;
        }
        public int Id { get; set; }
        public int AttemptCount { get; set; }
    }
}
