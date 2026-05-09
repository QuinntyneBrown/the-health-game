using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Abstractions.Time;
using HealthGame.Application.Activities.Commands;
using HealthGame.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HealthGame.Application.Activities.CommandHandlers;

public sealed class LogActivityCommandHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context,
    IClock clock,
    ITimeZoneResolver timeZoneResolver,
    ILogger<LogActivityCommandHandler> logger) : IRequestHandler<LogActivityCommand, ActivityEntryDto?>
{
    public async Task<ActivityEntryDto?> Handle(LogActivityCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();
        var now = clock.UtcNow;

        var goal = await context.Goals
            .Include(goal => goal.ActivityEntries)
            .Include(goal => goal.Rewards)
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
        var entry = goal.LogActivity(request.OccurredAtUtc, request.Quantity, request.Notes, now, timeZone);

        var streak = goal.CalculateStreak(now, timeZone);
        var earned = goal.EvaluateRewards(streak, now);

        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Logged activity {ActivityId} on goal {GoalId} for user {UserId}. Earned {EarnedCount} reward(s).",
            entry.Id, goal.Id, userId, earned.Count);

        return ActivityEntryDto.FromActivityEntry(entry);
    }
}
