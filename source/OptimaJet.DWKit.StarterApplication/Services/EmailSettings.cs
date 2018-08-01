using System;
namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class EmailSettings
    {
        public EmailSettings()
        {
            MaxEmailAttempts = 3;
        }
        public int MaxEmailAttempts { get; set; }
    }
}
