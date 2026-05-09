using MediatR;

namespace HealthGame.Application.Rewards.Commands;

public sealed record CreateRewardCommand(
    Guid GoalId,
    string Name,
    string? Description,
    RewardConditionDto Condition) : IRequest<RewardDto?>;
