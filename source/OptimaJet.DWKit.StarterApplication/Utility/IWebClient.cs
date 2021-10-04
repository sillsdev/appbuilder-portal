using System;
using System.Threading.Tasks;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public interface IWebClient
    {
        string DownloadString(string address);
        Task<string> DownloadStringTaskAsync(string address);
    }
}
