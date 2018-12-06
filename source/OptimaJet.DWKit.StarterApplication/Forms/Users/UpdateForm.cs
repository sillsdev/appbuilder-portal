using System;
using System.Linq;
using JsonApiDotNetCore.Data;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Forms.Users
{
    public class UpdateForm : BaseUserForm
    {
        public UserRepository UserRepository { get; }

        public UpdateForm(
            UserRepository userRepository,
            ICurrentUserContext currentUserContext,
            IEntityRepository<UserRole> userRolesRepository)
            : base(userRepository, userRolesRepository, currentUserContext)
        {
            UserRepository = userRepository;
        }

        public bool IsValid(int id, User user)
        {
            var original = UserRepository.Get()
                            .Where(u => u.Id == id)
                            .FirstOrDefaultAsync().Result;
            PublishingKey = String.IsNullOrEmpty(user.PublishingKey) ? original.PublishingKey : user.PublishingKey;
            base.ValidateUser();
            return base.IsValid();
        }
    }
}
