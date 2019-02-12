using JsonApiDotNetCore.Models;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.EventDispatcher.EntityEventHandler
{
    public interface IEntityHookHandler<TEntiity> where TEntiity : class, IIdentifiable
    {
        void DidInsert(string id);
        void DidUpdate(string id);
        void DidDelete(string id);
    } 
}