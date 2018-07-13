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

        public async Task<User> FindOrCreateUser(string auth0Id) 
        {
            var existing = this.EntityRepository.GetByAuth0Id(auth0Id);

            if (existing != null) return existing;

            var newUser = new User {
                ExternalId = auth0Id
            };

            var newEntity = await base.CreateAsync(newUser);

            return newEntity;
        }
    }
}