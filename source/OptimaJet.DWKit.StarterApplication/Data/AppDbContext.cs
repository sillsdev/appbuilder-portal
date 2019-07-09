using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        { }

        // NOTE: only one side of a relationship needs to be specified.
        //       (because each declaration on a side actually defines
        //        both sides in a single fluent builder chain)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.HasPostgresExtension("uuid-ossp");

            var userEntity = modelBuilder.Entity<User>();
            var roleEntity = modelBuilder.Entity<Role>();
            var userRoleEntity = modelBuilder.Entity<UserRole>();
            var orgEntity = modelBuilder.Entity<Organization>();
            var orgMemberEntity = modelBuilder.Entity<OrganizationMembership>();
            var orgMemberInvitesEntity = modelBuilder.Entity<OrganizationMembershipInvite>();
            var projectEntity = modelBuilder.Entity<Project>();
            var orgProductDefinitionEntity = modelBuilder.Entity<OrganizationProductDefinition>();
            var orgInviteEntity = modelBuilder.Entity<OrganizationInvite>();
            var groupMemberEntity = modelBuilder.Entity<GroupMembership>();
            var productEntity = modelBuilder.Entity<Product>();
            var productBuildEntity = modelBuilder.Entity<ProductBuild>();
            var notificationEntity = modelBuilder.Entity<Notification>();
            var productWorkflowEntity = modelBuilder.Entity<ProductWorkflow>();
            var workflowDefinitionEntity = modelBuilder.Entity<WorkflowDefinition>();
            var productWorkflowSchemeEntity = modelBuilder.Entity<ProductWorkflowScheme>();
            var productTransitionEntity = modelBuilder.Entity<ProductTransition>();

            userEntity
                .HasMany(u => u.OrganizationMemberships)
                .WithOne(om => om.User)
                .HasForeignKey(om => om.UserId);

            userEntity
                .HasMany(u => u.GroupMemberships)
                .WithOne(gm => gm.User)
                .HasForeignKey(gm => gm.UserId);

            userEntity
                .HasMany(u => u.UserRoles)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId);

            roleEntity
                .HasMany(r => r.UserRoles)
                .WithOne(ur => ur.Role)
                .HasForeignKey(ur => ur.RoleId);

            orgEntity
                .HasMany(o => o.OrganizationMemberships)
                .WithOne(om => om.Organization)
                .HasForeignKey(om => om.OrganizationId);

            orgEntity
                .HasMany(o => o.UserRoles)
                .WithOne(r => r.Organization)
                .HasForeignKey(r => r.OrganizationId);

            orgEntity
                .HasMany(o => o.Groups)
                .WithOne(g => g.Owner)
                .HasForeignKey(g => g.OwnerId);

            orgMemberInvitesEntity.Property(o => o.Token)
                .HasDefaultValueSql("uuid_generate_v4()")
                .IsRequired()
                .ValueGeneratedOnAdd();

            orgMemberInvitesEntity.Property(o => o.Expires)
                .HasDefaultValueSql("current_date + 7")
                .IsRequired()
                .ValueGeneratedOnAdd();

            orgMemberInvitesEntity.Property(o => o.Redeemed)
                .IsRequired()
                .HasDefaultValue(false);

            userEntity
                .Property(u => u.ProfileVisibility)
                .HasDefaultValue(ProfileVisibility.Public);
            userEntity
                .Property(u => u.EmailNotification)
                .HasDefaultValue(true);

            orgEntity
                .HasMany(o => o.OrganizationProductDefinitions)
                .WithOne(opd => opd.Organization)
                .HasForeignKey(opd => opd.OrganizationId);

            projectEntity
                .HasMany(r => r.Reviewers)
                .WithOne(rp => rp.Project)
                .HasForeignKey(rp => rp.ProjectId);

            projectEntity
                .Property(p => p.AllowDownloads)
                .HasDefaultValue(true);

            projectEntity
                .Property(p => p.AutomaticBuilds)
                .HasDefaultValue(true);

            orgEntity
                .Property(o => o.UseDefaultBuildEngine)
                .HasDefaultValue(true);
            orgEntity
                .Property(o => o.PublicByDefault)
                .HasDefaultValue(true);

            projectEntity
                .Property(p => p.IsPublic)
                .HasDefaultValue(true);

            orgEntity
                .HasMany(o => o.OrganizationStores)
                .WithOne(os => os.Organization)
                .HasForeignKey(os => os.OrganizationId);

            productEntity
                .HasMany(p => p.ProductBuilds)
                .WithOne(pb => pb.Product)
                .HasForeignKey(pb => pb.ProductId);

            productEntity
                .HasMany(p => p.ProductPublications)
                .WithOne(pb => pb.Product)
                .HasForeignKey(pb => pb.ProductId);

            productEntity
                .HasMany(p => p.UserTasks)
                .WithOne(ut => ut.Product)
                .HasForeignKey(ut => ut.ProductId);

            productBuildEntity
                .HasMany(pb => pb.ProductArtifacts)
                .WithOne(pa => pa.ProductBuild)
                .HasForeignKey(pa => pa.ProductBuildId);

            productBuildEntity
                .HasMany(pb => pb.ProductPublications)
                .WithOne(pp => pp.ProductBuild)
                .HasForeignKey(pp => pp.ProductBuildId);

            userEntity
                .HasIndex(u => u.WorkflowUserId);

            productEntity
                .Property(p => p.Id)
                .HasDefaultValueSql("uuid_generate_v4()");

            productEntity
                .HasMany(p => p.Transitions)
                .WithOne(t => t.Product)
                .HasForeignKey(p => p.ProductId);

            productEntity
                .HasOne(p => p.ProductWorkflow)
                .WithOne(i => i.Product)
                .HasForeignKey<ProductWorkflow>(i => i.Id);

            productWorkflowEntity.ToTable("WorkflowProcessInstance");

            projectEntity
                .Property(p => p.WorkflowProjectId)
                .HasDefaultValue(0);

            workflowDefinitionEntity
                .Property(w => w.Type)
                .HasDefaultValue(WorkflowType.Startup);

            productTransitionEntity
                .Property(t => t.TransitionType)
                .HasDefaultValue(ProductTransitionType.Activity);


            productWorkflowSchemeEntity.ToTable("WorkflowProcessScheme");

        }

        //// https://benjii.me/2014/03/track-created-and-modified-fields-automatically-with-entity-framework-code-first/
        private void AddTimestamps()
        {
            var entries = ChangeTracker.Entries().Where(e => e.Entity is ITrackDate && (e.State == EntityState.Added || e.State == EntityState.Modified));
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
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<OrganizationInvite> OrganizationInvites { get; set; }
        public DbSet<OrganizationMembership> OrganizationMemberships { get; set; }
        public DbSet<OrganizationMembershipInvite> OrganizationMembershipInvites { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<GroupMembership> GroupMemberships { get; set; }
        public DbSet<OrganizationInviteRequest> OrganizationInviteRequests { get; set; }
        public DbSet<Email> Emails { get; set; }
        public DbSet<ProductDefinition> ProductDefinitions { get; set; }
        public DbSet<OrganizationProductDefinition> OrganizationProductDefinitions { get; set; }
        public DbSet<WorkflowDefinition> WorkflowDefinitions { get; set; }
        public DbSet<ApplicationType> ApplicationTypes { get; set; }
        public DbSet<Reviewer> Reviewers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<SystemStatus> SystemStatuses { get; set; }
        public DbSet<Store> Stores { get; set; }
        public DbSet<StoreLanguage> StoreLanguages { get; set; }
        public DbSet<StoreType> StoreTypes { get; set; }
        public DbSet<OrganizationStore> OrganizationStores { get; set; }
        public DbSet<ProductArtifact> ProductArtifacts { get; set; }
        public DbSet<UserTask> UserTasks { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ProductTransition> ProductTransitions { get; set; }
        public DbSet<ProductBuild> ProductBuilds { get; set; }
        public DbSet<ProductPublication> ProductPublications { get; set; }
    }
}
