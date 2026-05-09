using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Abstractions.Time;
using HealthGame.Application.Activities.Commands;
using HealthGame.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HealthGame.Application.Activities.CommandHandlers;

public sealed class DeleteActivityEntryCommandHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context,
    IClock clock,
    ITimeZoneResolver timeZoneResolver,
    ILogger<DeleteActivityEntryCommandHandler> logger) : IRequestHandler<DeleteActivityEntryCommand, bool>
{
    public async Task<bool> Handle(DeleteActivityEntryCommand request, CancellationToken cancellationToken)
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
            return false;
        }

        var entry = goal.ActivityEntries
            .FirstOrDefault(activity => activity.Id == request.ActivityEntryId && !activity.IsDeleted);

        if (entry is null)
        {
            return false;
        }

        goal.DeleteActivityEntry(request.ActivityEntryId, now);

        var timeZone = timeZoneResolver.Resolve(goal.TimeZoneId);
        var streak = goal.CalculateStreak(now, timeZone);
        goal.EvaluateRewards(streak, now);

        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Deleted activity {ActivityId} on goal {GoalId}.", request.ActivityEntryId, goal.Id);

        return true;
    }
}
