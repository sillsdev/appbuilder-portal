using System;
namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public interface IWebClient
    {
        string DownloadString(string address);
    }
}
