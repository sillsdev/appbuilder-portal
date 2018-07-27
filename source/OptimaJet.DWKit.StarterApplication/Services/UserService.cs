using System;
using System.Threading.Tasks;
using JsonApiDotNetCore.Data;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using Optimajet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class UserService : EntityResourceService<User>
    {
        public UserRepository EntityRepository { get; }


        public UserService(
            IJsonApiContext jsonApiContext,
            IEntityRepository<User> entityRepository,
            ILoggerFactory loggerFactory) : base(jsonApiContext, entityRepository, loggerFactory)
        {
            this.EntityRepository = (UserRepository)entityRepository;
        }
    }
}
