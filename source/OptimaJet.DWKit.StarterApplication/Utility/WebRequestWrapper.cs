using System;
using System.Diagnostics.Contracts;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public class WebRequestWrapper
    {

        public virtual ProductArtifact GetFileInfo(ProductArtifact artifact)
        {
            var modifiedArtifact = artifact;
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(artifact.Url);
            request.Method = "HEAD";
            try
            {
                using (HttpWebResponse resp = (HttpWebResponse)(request.GetResponse()))
                {
                    modifiedArtifact.ContentType = resp.ContentType;
                    modifiedArtifact.LastModified = resp.LastModified.ToUniversalTime();
                    if (resp.ContentType != "text/html")
                    {
                        modifiedArtifact.FileSize = resp.ContentLength;
                    }
                }
            }
            catch (Exception)
            {

            }
            return modifiedArtifact;
        }
    }
}
