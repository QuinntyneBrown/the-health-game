using System.ComponentModel.DataAnnotations;
using HealthGame.Application.Rewards;
using HealthGame.Application.Rewards.Commands;

namespace HealthGame.Api.Contracts;

public sealed record CreateRewardRequest(
    [property: Required]
    [property: StringLength(120)]
    string Name,

    [property: StringLength(500)]
    string? Description,

    [property: Required]
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
