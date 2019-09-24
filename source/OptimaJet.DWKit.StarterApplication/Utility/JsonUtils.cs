using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public static class JsonUtils
    {
        public static Dictionary<string, object> MergeProperties(Dictionary<string, object> baseProps, Dictionary<string, object> higherProps)
        {
            var result = new Dictionary<string, object>(baseProps);
            foreach (var kv in higherProps)
            {
                if (!result.ContainsKey(kv.Key))
                {
                    result.Add(kv.Key, kv.Value);
                }
                else
                {
                    JObject baseObject = result[kv.Key] as JObject;
                    JObject higherObject = kv.Value as JObject;
                    baseObject.Merge(higherObject, new JsonMergeSettings { MergeArrayHandling = MergeArrayHandling.Union });
                    result[kv.Key] = baseObject;
                }
            }
            return result;
        }

        public static Dictionary<string, object> DeserializeProperties(string properties) =>
            string.IsNullOrWhiteSpace(properties)
                ? new Dictionary<string, object>()
                : JsonConvert.DeserializeObject<Dictionary<string, object>>(properties);
    }
}
