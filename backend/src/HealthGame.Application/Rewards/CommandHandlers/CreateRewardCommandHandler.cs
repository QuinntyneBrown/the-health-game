using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Abstractions.Time;
using HealthGame.Application.Common;
using HealthGame.Application.Rewards.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HealthGame.Application.Rewards.CommandHandlers;

public sealed class CreateRewardCommandHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context,
    IClock clock,
    ILogger<CreateRewardCommandHandler> logger) : IRequestHandler<CreateRewardCommand, RewardDto?>
{
    public async Task<RewardDto?> Handle(CreateRewardCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();
        var now = clock.UtcNow;

        var goal = await context.Goals
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

        var reward = goal.DefineReward(request.Name, request.Description, request.Condition.ToCondition(), now);

        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Created reward {RewardId} for goal {GoalId}.", reward.Id, goal.Id);

        return RewardDto.FromReward(reward);
    }
}
