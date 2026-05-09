using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Abstractions.Time;
using HealthGame.Application.Common;
using HealthGame.Application.Goals.Commands;
using HealthGame.Domain.Goals;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HealthGame.Application.Goals.CommandHandlers;

public sealed class UpdateGoalCommandHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context,
    IClock clock,
    ILogger<UpdateGoalCommandHandler> logger) : IRequestHandler<UpdateGoalCommand, GoalDto?>
{
    public async Task<GoalDto?> Handle(UpdateGoalCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();
        var now = clock.UtcNow;

        var goal = await context.Goals
            .FirstOrDefaultAsync(
                goal => goal.Id == request.GoalId && goal.UserId == userId && goal.DeletedAtUtc == null,
                cancellationToken);

        if (goal is null)
        {
            return null;
        }

        var cadence = GoalCadence.Create(request.Cadence.Type, request.Cadence.Interval);

        goal.Update(request.Name, request.Description, request.TargetQuantity, request.TargetUnit, cadence, now);

        if (request.TimeZoneId is not null || request.WeekStartsOn is not null)
        {
            goal.UpdateSchedule(
                request.TimeZoneId ?? goal.TimeZoneId,
                request.WeekStartsOn ?? goal.WeekStartsOn,
                now);
        }

        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Updated goal {GoalId} for user {UserId}.", goal.Id, userId);

        return GoalDto.FromGoal(goal);
    }
}
