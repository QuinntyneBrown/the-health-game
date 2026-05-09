using HealthGame.Application.Rewards;
using HealthGame.Application.Rewards.Commands;

namespace HealthGame.Api.Contracts;

public sealed record CreateRewardRequest(
    string Name,
    string? Description,
    RewardConditionRequest Condition)
{
    public CreateRewardCommand ToCommand(Guid goalId)
    {
        return new CreateRewardCommand(
            goalId,
            Name,
            Description,
            new RewardConditionDto(Condition.Type, Condition.RequiredStreakCount));
    }
}
