using System;
namespace OptimaJet.DWKit.StarterApplication.Services
{
    public interface IProjectImportService
    {
        void Process(ProjectImportServiceData data);
    }

    public class ProjectImportServiceData
    {
        public int Id { get; set; }
    }
}
