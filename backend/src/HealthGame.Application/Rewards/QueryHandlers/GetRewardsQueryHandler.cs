using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Common;
using HealthGame.Application.Rewards.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HealthGame.Application.Rewards.QueryHandlers;

public sealed class GetRewardsQueryHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context) : IRequestHandler<GetRewardsQuery, IReadOnlyCollection<RewardDto>>
{
    public async Task<IReadOnlyCollection<RewardDto>> Handle(GetRewardsQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var rewards = await context.Rewards
            .AsNoTracking()
            .Where(reward => reward.UserId == userId)
            .OrderBy(reward => reward.CreatedAtUtc)
            .ToArrayAsync(cancellationToken);

        return rewards.Select(RewardDto.FromReward).ToArray();
    }
}
