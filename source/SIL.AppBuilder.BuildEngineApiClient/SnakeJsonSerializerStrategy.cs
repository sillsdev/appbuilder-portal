using System.Linq;
using SimpleJson;
using Humanizer;

namespace SIL.AppBuilder.BuildEngineApiClient
{
    public class SnakeJsonSerializerStrategy : PocoJsonSerializerStrategy
    {
        protected override string MapClrMemberNameToJsonFieldName(string clrPropertyName)
        {
            //PascalCase to snake_case
            return clrPropertyName.Underscore();
        }
    }
}
