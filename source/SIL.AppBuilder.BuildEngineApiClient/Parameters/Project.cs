using System;
using RestSharp.Deserializers;

namespace SIL.AppBuilder.BuildEngineApiClient
{
    public class Project
    {
        public string UserId { get; set; }
        public string GroupId { get; set; }
        public string AppId { get; set; }
        public string ProjectName { get; set; }
        public string LanguageCode { get; set; }
        public string PublishingKey { get; set; }
        public string StorageType { get; set; }
    }
}
