using JsonApiDotNetCore.Configuration;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;

namespace OptimaJet.DWKit.StarterApplication.Services
{
  public class OrbitJSQueryParser : QueryParser
  {
    public OrbitJSQueryParser(IControllerContext controllerContext, JsonApiOptions options) : base(controllerContext, options)
    {
    }

    protected override PageQuery ParsePageQuery(PageQuery pageQuery, string key, string value)
    {
      // expected input = page[size]=10
      //                  page[number]=1
      pageQuery = pageQuery ?? new PageQuery();

      var propertyName = key.Split(QueryConstants.OPEN_BRACKET, QueryConstants.CLOSE_BRACKET)[1];

      // const string SIZE = "size";
      // const string NUMBER = "number";
      const string SIZE = "limit";
      const string NUMBER = "offset";

      if (propertyName == SIZE)
        pageQuery.PageSize = int.TryParse(value, out var pageSize) ?
        pageSize :
        throw new JsonApiException(400, $"Invalid page size '{value}'");

      else if (propertyName == NUMBER)
        pageQuery.PageOffset = int.TryParse(value, out var pageOffset) ?
        pageOffset :
        throw new JsonApiException(400, $"Invalid page offset '{value}'");

      return pageQuery;
    }
  }
}
