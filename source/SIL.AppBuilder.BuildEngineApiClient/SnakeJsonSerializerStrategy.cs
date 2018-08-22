using System.Linq;
using SimpleJson;

namespace SIL.AppBuilder.BuildEngineApiClient
{
    public class SnakeJsonSerializerStrategy : PocoJsonSerializerStrategy
    {
        protected override string MapClrMemberNameToJsonFieldName(string clrPropertyName)
        {
            //PascalCase to snake_case
            return string.Concat(clrPropertyName.Select((x, i) => char.IsUpper(x) ? (i > 0 ? "_" : "") + char.ToLower(x).ToString() : x.ToString()));
        }
    }
}
