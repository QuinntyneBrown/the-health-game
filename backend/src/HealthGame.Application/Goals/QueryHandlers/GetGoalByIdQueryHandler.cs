using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Abstractions.Time;
using HealthGame.Application.Common;
using HealthGame.Application.Goals.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HealthGame.Application.Goals.QueryHandlers;

public sealed class GetGoalByIdQueryHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context,
    IClock clock,
    ITimeZoneResolver timeZoneResolver) : IRequestHandler<GetGoalByIdQuery, GoalDto?>
{
    public async Task<GoalDto?> Handle(GetGoalByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var goal = await context.Goals
            .AsNoTracking()
            .Include(goal => goal.ActivityEntries)
            .FirstOrDefaultAsync(
                goal => goal.Id == request.GoalId
                    && goal.UserId == userId
                    && goal.DeletedAtUtc == null,
                cancellationToken);

        if (goal is null)
        {
            return null;
        }

        var timeZone = timeZoneResolver.Resolve(goal.TimeZoneId);
        var streak = StreakSummaryDto.FromStreakSummary(goal.CalculateStreak(clock.UtcNow, timeZone));

        return GoalDto.FromGoal(goal, streak);
    }
}
