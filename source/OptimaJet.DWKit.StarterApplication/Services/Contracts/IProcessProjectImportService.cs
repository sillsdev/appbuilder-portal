using System;
namespace OptimaJet.DWKit.StarterApplication.Services
{
    public interface IProcessProjectImportService
    {
        void Process(ProcessProjectImportServiceData data);
    }

    public class ProcessProjectImportServiceData
    {
        public int Id { get; set; }
    }
}
