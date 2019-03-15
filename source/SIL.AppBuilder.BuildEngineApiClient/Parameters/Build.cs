using System;
using System.Collections.Generic;

namespace SIL.AppBuilder.BuildEngineApiClient
{
    public class Build
    {
        public string Targets { get; set; }
        public Dictionary<string, string> Environment { get; set; }
    }
}
