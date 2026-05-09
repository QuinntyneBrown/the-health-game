using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Abstractions.Time;
using HealthGame.Application.Common;
using HealthGame.Application.Goals.Commands;
using HealthGame.Domain.Goals;
using MediatR;
using Microsoft.Extensions.Logging;

namespace HealthGame.Application.Goals.CommandHandlers;

public sealed class CreateGoalCommandHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context,
    IClock clock,
    ILogger<CreateGoalCommandHandler> logger) : IRequestHandler<CreateGoalCommand, GoalDto>
{
    public async Task<GoalDto> Handle(CreateGoalCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();
        var cadence = GoalCadence.Create(request.Cadence.Type, request.Cadence.Interval);

        var goal = Goal.Create(
            userId,
            request.Name,
            request.Description,
            request.TargetQuantity,
            request.TargetUnit,
            cadence,
            clock.UtcNow);

        await context.Goals.AddAsync(goal, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Created goal {GoalId} for user {UserId}.", goal.Id, userId);

        return GoalDto.FromGoal(goal);
    }
}
