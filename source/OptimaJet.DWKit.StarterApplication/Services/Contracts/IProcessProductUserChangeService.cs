using System;
namespace OptimaJet.DWKit.StarterApplication.Services.Contracts
{
    public interface IProcessProductUserChangeService
    {
        void Process(ProcessProductUserChangeData data);
    }

    public class ProcessProductUserChangeData
    {
        public int Id { get; set; }
    }
}

