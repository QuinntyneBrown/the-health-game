using HealthGame.Domain.Goals;

namespace HealthGame.Application.Rewards;

public sealed record RewardDto(
    Guid Id,
    Guid GoalId,
    string Name,
    string? Description,
    RewardConditionDto Condition,
    bool IsEarned,
    DateTimeOffset? EarnedAtUtc,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc)
{
    public static RewardDto FromReward(Reward reward)
    {
        return new RewardDto(
            reward.Id,
            reward.GoalId,
            reward.Name,
            reward.Description,
            RewardConditionDto.FromCondition(reward.Condition),
            reward.IsEarned,
            reward.EarnedAtUtc,
            reward.CreatedAtUtc,
            reward.UpdatedAtUtc);
    }
}
