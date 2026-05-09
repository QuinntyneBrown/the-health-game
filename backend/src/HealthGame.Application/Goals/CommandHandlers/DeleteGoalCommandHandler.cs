using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Abstractions.Time;
using HealthGame.Application.Common;
using HealthGame.Application.Goals.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HealthGame.Application.Goals.CommandHandlers;

public sealed class DeleteGoalCommandHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context,
    IClock clock,
    ILogger<DeleteGoalCommandHandler> logger) : IRequestHandler<DeleteGoalCommand, bool>
{
    public async Task<bool> Handle(DeleteGoalCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var goal = await context.Goals
            .FirstOrDefaultAsync(
                goal => goal.Id == request.GoalId && goal.UserId == userId && goal.DeletedAtUtc == null,
                cancellationToken);

        if (goal is null)
        {
            return false;
        }

        goal.Delete(clock.UtcNow);

        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Deleted goal {GoalId} for user {UserId}.", goal.Id, userId);

        return true;
    }
}
