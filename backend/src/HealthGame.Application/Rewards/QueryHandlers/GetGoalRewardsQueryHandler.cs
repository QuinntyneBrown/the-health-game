using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Common;
using HealthGame.Application.Rewards.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HealthGame.Application.Rewards.QueryHandlers;

public sealed class GetGoalRewardsQueryHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context) : IRequestHandler<GetGoalRewardsQuery, IReadOnlyCollection<RewardDto>?>
{
    public async Task<IReadOnlyCollection<RewardDto>?> Handle(
        GetGoalRewardsQuery request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var goalExists = await context.Goals
            .AsNoTracking()
            .AnyAsync(
                goal => goal.Id == request.GoalId
                    && goal.UserId == userId
                    && goal.DeletedAtUtc == null,
                cancellationToken);

        if (!goalExists)
        {
            return null;
        }

        var rewards = await context.Rewards
            .AsNoTracking()
            .Where(reward => reward.GoalId == request.GoalId && reward.UserId == userId)
            .OrderBy(reward => reward.CreatedAtUtc)
            .ToArrayAsync(cancellationToken);

        return rewards.Select(RewardDto.FromReward).ToArray();
    }
}
