using System.IO;
using System.Text;
using System.Threading.Tasks;
using I18Next.Net.Backends;
using I18Next.Net.TranslationTrees;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public class ScriptoriaI18NextFileBackend : ITranslationBackend
    {

        private readonly string _basePath;
        private readonly ITranslationTreeBuilderFactory _treeBuilderFactory;

        public ScriptoriaI18NextFileBackend(string basePath)
            : this(basePath, new ScriptoriaI18NextTranslationTreeBuilderFactory<HierarchicalTranslationTreeBuilder>())
        {
        }

        public ScriptoriaI18NextFileBackend(string basePath, ITranslationTreeBuilderFactory treeBuilderFactory)
        {
            _basePath = basePath;
            _treeBuilderFactory = treeBuilderFactory;
        }

        public ScriptoriaI18NextFileBackend(ITranslationTreeBuilderFactory treeBuilderFactory)
            : this("locales", treeBuilderFactory)
        {
        }

        public ScriptoriaI18NextFileBackend()
            : this("locales")
        {
        }

        public Encoding Encoding { get; set; } = Encoding.UTF8;

        public async Task<ITranslationTree> LoadNamespaceAsync(string language, string @namespace)
        {
            var path = FindFile(language, @namespace);

            if (path == null)
                return null;

            JObject parsedJson;

            using (var streamReader = new StreamReader(path, Encoding))
            using (var reader = new JsonTextReader(streamReader))
            {
                parsedJson = (JObject)await JToken.ReadFromAsync(reader);
            }

            var builder = _treeBuilderFactory.Create();

            PopulateTreeBuilder("", parsedJson, builder);

            return builder.Build();
        }

        private string FindFile(string language, string @namespace)
        {
            var path = Path.Combine(_basePath, language + ".json");

            if (File.Exists(path))
                return path;
            
            path = Path.Combine(_basePath, GetLanguagePart(language) + ".json");

            return !File.Exists(path) ? null : path;
        }

        private static void PopulateTreeBuilder(string path, JObject node, ITranslationTreeBuilder builder)
        {
            if (path != string.Empty)
                path = path + ".";

            foreach (var childNode in node)
            {
                var key = path + childNode.Key;

                if (childNode.Value is JObject jObj)
                    PopulateTreeBuilder(key, jObj, builder);
                else if (childNode.Value is JValue jVal)
                    builder.AddTranslation(key, jVal.Value.ToString());
            }
        }
        public static string GetLanguagePart(string language)
        {
            var index = language.IndexOf('-');

            if (index == -1)
                return language;

            return language.Substring(0, index);
        }

    }
}
