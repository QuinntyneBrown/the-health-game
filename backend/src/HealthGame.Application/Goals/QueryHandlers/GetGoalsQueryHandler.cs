using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Abstractions.Time;
using HealthGame.Application.Common;
using HealthGame.Application.Goals.Queries;
using HealthGame.Domain.Goals;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HealthGame.Application.Goals.QueryHandlers;

public sealed class GetGoalsQueryHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context,
    IClock clock,
    ITimeZoneResolver timeZoneResolver) : IRequestHandler<GetGoalsQuery, IReadOnlyCollection<GoalDto>>
{
    public async Task<IReadOnlyCollection<GoalDto>> Handle(GetGoalsQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();
        var now = clock.UtcNow;

        var userGoals = await context.Goals
            .AsNoTracking()
            .Include(goal => goal.ActivityEntries)
            .Where(goal => goal.UserId == userId && goal.DeletedAtUtc == null)
            .OrderBy(goal => goal.Name)
            .Take(100)
            .ToArrayAsync(cancellationToken);

        return userGoals
            .Select(goal => GoalDto.FromGoal(goal, BuildStreak(goal, now)))
            .ToArray();
    }

    private StreakSummaryDto BuildStreak(Goal goal, DateTimeOffset now)
    {
        var timeZone = timeZoneResolver.Resolve(goal.TimeZoneId);
        return StreakSummaryDto.FromStreakSummary(goal.CalculateStreak(now, timeZone));
    }
}
