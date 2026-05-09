using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Domain.Goals;
using HealthGame.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace HealthGame.Infrastructure.Data;

public sealed class HealthGameContext(DbContextOptions<HealthGameContext> options)
    : DbContext(options), IHealthGameContext
{
    public DbSet<Goal> Goals => Set<Goal>();

    public DbSet<ActivityEntry> ActivityEntries => Set<ActivityEntry>();

    public DbSet<Reward> Rewards => Set<Reward>();

    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(HealthGameContext).Assembly);
    }
}
