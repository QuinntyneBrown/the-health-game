using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Abstractions.Time;
using HealthGame.Application.Activities.Commands;
using HealthGame.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HealthGame.Application.Activities.CommandHandlers;

public sealed class UpdateActivityEntryCommandHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context,
    IClock clock,
    ITimeZoneResolver timeZoneResolver,
    ILogger<UpdateActivityEntryCommandHandler> logger) : IRequestHandler<UpdateActivityEntryCommand, ActivityEntryDto?>
{
    public async Task<ActivityEntryDto?> Handle(UpdateActivityEntryCommand request, CancellationToken cancellationToken)
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

        var entry = goal.ActivityEntries
            .FirstOrDefault(activity => activity.Id == request.ActivityEntryId && !activity.IsDeleted);

        if (entry is null)
        {
            return null;
        }

        goal.UpdateActivityEntry(request.ActivityEntryId, request.Quantity, request.Notes, now);

        var timeZone = timeZoneResolver.Resolve(goal.TimeZoneId);
        var streak = goal.CalculateStreak(now, timeZone);
        goal.EvaluateRewards(streak, now);

        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Updated activity {ActivityId} on goal {GoalId}.", entry.Id, goal.Id);

        return ActivityEntryDto.FromActivityEntry(entry);
    }
}
