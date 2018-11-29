using I18Next.Net.TranslationTrees;
namespace OptimaJet.DWKit.StarterApplication.Utility
{
    public class ScriptoriaI18NextTranslationTreeBuilderFactory<T> : ITranslationTreeBuilderFactory
        where T : ITranslationTreeBuilder, new()
    {
        public ITranslationTreeBuilder Create()
        {
            return new T();
        }
    }
}
