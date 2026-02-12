using AIBackendAPI.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace AIBackendAPI.Data;

public class UsageContext(DbContextOptions<UsageContext> options) : DbContext(options)
{
    public DbSet<AIModel> AIModels { get; set; } = null!;
    public DbSet<AIModelCall> AIModelCalls { get; set; } = null!;
    public DbSet<TopAIModel> TopAIModels { get; set; } = null!;
    public DbSet<Usage> Usages { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AIModel>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<AIModelCall>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<AIModelCall>()
            .HasOne(x => x.AIModel)
            .WithMany()
            .HasForeignKey(x => x.AIModelId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TopAIModel>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<TopAIModel>()
            .HasOne(x => x.AIModel)
            .WithMany()
            .HasForeignKey(x => x.AIModelId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Usage>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<Usage>()
            .HasMany(x => x.TopModels)
            .WithOne()
            .HasForeignKey(x => x.TeamId)
            .OnDelete(DeleteBehavior.Restrict);

    }
}