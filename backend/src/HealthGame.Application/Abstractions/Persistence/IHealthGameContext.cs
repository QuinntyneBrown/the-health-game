using HealthGame.Domain.Goals;
using Microsoft.EntityFrameworkCore;

namespace HealthGame.Application.Abstractions.Persistence;

public interface IHealthGameContext
{
    DbSet<Goal> Goals { get; }

    DbSet<ActivityEntry> ActivityEntries { get; }

    DbSet<Reward> Rewards { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
