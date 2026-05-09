using HealthGame.Domain.Goals;
using HealthGame.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace HealthGame.Application.Abstractions.Persistence;

public interface IHealthGameContext
{
    DbSet<Goal> Goals { get; }

    DbSet<ActivityEntry> ActivityEntries { get; }

    DbSet<Reward> Rewards { get; }

    DbSet<UserProfile> UserProfiles { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
