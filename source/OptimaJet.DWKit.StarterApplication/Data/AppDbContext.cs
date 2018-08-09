using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Optimajet.DWKit.StarterApplication.Models;

namespace Optimajet.DWKit.StarterApplication.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {}

        // NOTE: only one side of a relationship needs to be specified.
        //       (because each declaration on a side actually defines
        //        both sides in a single fluent builder chain)
        protected override void OnModelCreating(ModelBuilder modelBuilder) 
        {
            var userEntity = modelBuilder.Entity<User>();
            var orgEntity = modelBuilder.Entity<Organization>();
            var orgMemberEntity = modelBuilder.Entity<OrganizationMembership>();
            var orgInviteEntity = modelBuilder.Entity<OrganizationInvite>();
            var groupMemberEntity = modelBuilder.Entity<GroupMembership>();

            userEntity
                .HasMany(u => u.OrganizationMemberships)
                .WithOne(om => om.User)
                .HasForeignKey(om => om.UserId);

            userEntity
                .HasMany(u => u.GroupMemberships)
                .WithOne(gm => gm.User)
                .HasForeignKey(gm => gm.UserId);

            orgEntity
                .HasMany(o => o.OrganizationMemberships)
                .WithOne(om => om.Organization)
                .HasForeignKey(om => om.OrganizationId);

            userEntity
                .Property(u => u.ProfileVisibility)
                .HasDefaultValue(ProfileVisibility.Public);
        }

        //// https://benjii.me/2014/03/track-created-and-modified-fields-automatically-with-entity-framework-code-first/
        private void AddTimestamps()
        {
            var entries = ChangeTracker.Entries().Where(e => e.Entity is ITrackDate && e.State == EntityState.Added || e.State == EntityState.Modified);
            DateTime now = DateTime.UtcNow;
            foreach (var entry in entries)
            {
                if (entry.Entity is ITrackDate trackDate)
                {
                    if (entry.State == EntityState.Added)
                    {
                        trackDate.DateCreated = now;
                    }
                    trackDate.DateUpdated = now;
                }
            }
        }
        public override int SaveChanges()
        {
            AddTimestamps();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            AddTimestamps();
            return await base.SaveChangesAsync(cancellationToken);
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<OrganizationInvite> OrganizationInvites { get; set; }
        public DbSet<OrganizationMembership> OrganizationMemberships { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<GroupMembership> GroupMemberships { get; set; }
        public DbSet<OrganizationInviteRequest> OrganizationInviteRequests { get; set; }
        public DbSet<Email> Emails { get; set; }
        public DbSet<ProductDefinition> ProductDefinitions { get; set; }
        public DbSet<WorkflowDefinition> WorkflowDefinitions { get; set; }
        public DbSet<ApplicationType> ApplicationTypes { get; set; }
    }
}
