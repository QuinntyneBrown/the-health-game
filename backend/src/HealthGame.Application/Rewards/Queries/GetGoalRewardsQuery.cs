using MediatR;

namespace HealthGame.Application.Rewards.Queries;

public sealed record GetGoalRewardsQuery(Guid GoalId) : IRequest<IReadOnlyCollection<RewardDto>?>;
