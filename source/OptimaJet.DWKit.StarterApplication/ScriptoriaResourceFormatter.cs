using System;
using System.Reflection;
using Humanizer;
using JsonApiDotNetCore.Graph;
using JsonApiDotNetCore.Models;

using str = JsonApiDotNetCore.Extensions.StringExtensions;

namespace OptimaJet.DWKit.StarterApplication
{
  public class ScriptoriaResourceFormatter : IResourceNameFormatter
  {
    public string ApplyCasingConvention(string properName) => str.Dasherize(properName);

    public string FormatPropertyName(PropertyInfo property) => str.Dasherize(property.Name);


    /// <summary>
    /// Uses the internal type name to determine the external resource name.
    /// By default we us Humanizer for pluralization and then we dasherize the name.
    /// </summary>
    /// <example>
    /// <code>
    /// _default.FormatResourceName(typeof(TodoItem)).Dump(); 
    /// // > "todo-items"
    /// </code>
    /// </example>
    public string FormatResourceName(Type type)
    {
        try
        {
            // check the class definition first
            // [Resource("models"] public class Model : Identifiable { /* ... */ }
            if (type.GetCustomAttribute(typeof(ResourceAttribute)) is ResourceAttribute attribute)
                return attribute.ResourceName;

            return ApplyCasingConvention(type.Name.Singularize()); // removed pluralize -- now whatever the class name is will be the type
        }
        catch (InvalidOperationException e)
        {
            throw new InvalidOperationException($"Cannot define multiple {nameof(ResourceAttribute)}s on type '{type}'.", e);
        }
    }
  }
}