using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.Core.Metadata.DbObjects;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using Serilog;

namespace OptimaJet.DWKit.StarterApplication.Services.Workflow
{
    public class WorkflowSecuritySyncService
    {
        public IJobRepository<User> UserRepository { get; }

        public WorkflowSecuritySyncService(
            IJobRepository<User> userRepository
            )
        {
            UserRepository = userRepository;
        }

        public void SyncWorkflowSecurity()
        {
            SyncDatabaseTablesAsync().Wait();
        }


        public void SyncNewUser(int userId) {
            var user = UserRepository.GetAsync(userId).Result;
            if (user != null && !user.WorkflowUserId.HasValue) 
            {
                var dwuser = CreateDwUser(user).Result;
                SyncUserToDwUser(user, dwuser);
            }
        }

        private async Task SyncDatabaseTablesAsync()
        {
            // Remove DWUsers that are not in Users
            var users = UserRepository
                .Get()
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .ToList();
            var dwusers = SecurityUser.SelectAsync().Result;
            var hashUsers = GetHashUsers(users);
            var hashDwUsers = GetHashDwUsers(dwusers);
            var removeUsers = hashDwUsers.Keys.Except(hashUsers.Keys).ToList();
            if (removeUsers.Any()) {
                try
                {
                    // Must remove SecurityUserToSecurityRole first or there
                    // would be an exception attempting to delete the user where
                    // the relationship is still there
                    var removeAdmins = GetHashDwAdmins(removeUsers);
                    await SecurityUserToSecurityRole.DeleteAsync(removeAdmins.Values.ToList());
                    await SecurityUser.DeleteAsync(removeUsers);
                    hashDwUsers = hashDwUsers
                        .Where(kvp => !removeUsers.Contains(kvp.Key))
                        .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
                }
                catch (Exception ex)
                {
                    // TODO: SendNotification
                    Log.Error(ex, $"Failed to Delete DwSecurityUsers: {String.Join(", ", removeUsers.ToArray())}");
                }
            }

            // Add DWUsers where User.WorkflowUserId is null
            foreach (var user in users.Where(user => !user.WorkflowUserId.HasValue))
            {
                try
                {
                    var dwuser = await CreateDwUser(user);
                    hashDwUsers.Add(dwuser.Id, dwuser);
                    hashUsers.Add(user.WorkflowUserId.Value, user);
                }
                catch (Exception ex)
                {
                    // TODO: SendNotification
                    Log.Error(ex, $"Failed to Create DwSecurityUser for User: id={user.Id}, name={user.Name}");
                }
            }

            // Sync properties
            foreach (var user in users)
            {
                try
                {
                    var dwuser = hashDwUsers[user.WorkflowUserId.Value];
                    dwuser.StartTracking();
                    SyncUserToDwUser(user, dwuser);
                    await dwuser.ApplyAsync();
                    await EnsureSecurityCredentials(user, dwuser);
                    await SyncRoles(user);
                }
                catch (Exception ex)
                {
                    // TODO: SendNotification
                    Log.Error(ex, $"Failed to Sync DwSecurityUser To User: id={user.Id}, name={user.Name}, WorkflowUserId={user.WorkflowUserId.GetValueOrDefault()}");
                }
            }
        }

        private async Task<SecurityUser> CreateDwUser(User user)
        {
            var dwuser = new SecurityUser { Id = Guid.NewGuid(), Name = DwUserName(user) };
            await SecurityUser.ApplyAsync(dwuser);
            user.WorkflowUserId = dwuser.Id;
            await UserRepository.UpdateAsync(user);
            return dwuser;
        }

        /// <summary>
        /// The Name for DwSecurityUser which is required.
        /// </summary>
        /// <returns>The user name</returns>
        /// <param name="user">User.</param>
        private String DwUserName(User user)
        {
            if (!String.IsNullOrWhiteSpace(user.Name)) return user.Name;
            if (!String.IsNullOrEmpty(user.FamilyName)) return user.FamilyName;
            if (!String.IsNullOrEmpty(user.GivenName)) return user.GivenName;
            return user.Id.ToString();
        }

        private void SyncUserToDwUser(User user, SecurityUser dwuser)
        {
            dwuser.Name = DwUserName(user);
            dwuser.Email = user.Email;
            dwuser.IsLocked = user.IsLocked;
            dwuser.Timezone = user.Timezone;
            dwuser.Localization = user.Locale;
            dwuser.ExternalId = user.ExternalId;
        }

        private async Task EnsureSecurityCredentials(User user, SecurityUser dwuser)
        {
            var filter = OptimaJet.DWKit.Core.Filter.Equals(user.Email, "Login");
            // TODO: figure out how to use OptimaJet's custom ORM
            var notFilteredCauseReasons = await SecurityCredential.SelectAsync(filter);

            var existing = notFilteredCauseReasons.FirstOrDefault(cred => cred.Login == user.Email);

            if (existing != null) {
                return;
            }

            var credential = new SecurityCredential {
                Id = Guid.NewGuid(),
                SecurityUserId = dwuser.Id,
                Login = user.Email,
                PasswordHash = "API User",
                PasswordSalt = "API User"
            };

            // credential.StartTracking();
            await SecurityCredential.ApplyAsync(credential);
        }

        private async Task SyncRoles(User user)
        {
            var adminRole = await SecurityRole.SelectByCode("Admins");
            var dwUserToRole = await SecurityUserToSecurityRole.SelectByUser(user.WorkflowUserId.Value);
            if (user.HasRole(RoleName.SuperAdmin))
            {
                // Make sure User is in "Admins" Role
                if (!dwUserToRole.Any(utr => utr.SecurityRoleId == adminRole.Id))
                {
                    var newAdmin = new SecurityUserToSecurityRole
                    {
                        Id = Guid.NewGuid(),
                        SecurityRoleId = adminRole.Id,
                        SecurityUserId = user.WorkflowUserId.Value
                    };

                    await SecurityUserToSecurityRole.ApplyAsync(newAdmin);
                }
            }
            else
            {
                // Make sure User is not "Admins" Role
                var userAdminRole = dwUserToRole.FirstOrDefault(dtr => dtr.SecurityRoleId == adminRole.Id);
                if (userAdminRole != null)
                {
                    await SecurityUserToSecurityRole.DeleteAsync(userAdminRole.Id);
                }
            }
        }
        private Dictionary<Guid, User> GetHashUsers(List<User> users)
        {
            var hash = users
                .Where(u => u.WorkflowUserId.HasValue)
                .Select(u => new { u.WorkflowUserId.Value, u })
                .AsEnumerable()
                .ToDictionary(kvp => kvp.Value, kvp => kvp.u);
            return hash;
        }

        private Dictionary<Guid, SecurityUser> GetHashDwUsers(List<SecurityUser> dwusers)
        {
            // Filter out default user (admin).
            // TODO: Is there a better way? ExternalId == null?
            var hash = dwusers
                .Where(dwuser => !dwuser.Name.Equals("admin"))
                .ToDictionary(dwuser => dwuser.Id, dwuser => dwuser);
            return hash;
        }

        private Dictionary<Guid, SecurityUserToSecurityRole> GetHashDwAdmins(List<Guid> userids)
        {
            var adminRole = SecurityRole.SelectByCode("Admins").Result;
            var usersToAdminRoles = SecurityUserToSecurityRole.SelectByRole(adminRole.Id).Result;
            var hash = usersToAdminRoles
                .Where(ur => ur.SecurityRoleId == adminRole.Id && userids.Any(uid => uid == ur.SecurityUserId))
                .ToDictionary(ur => ur.SecurityUserId, ur => ur);

            return hash;
        }
    }
}
