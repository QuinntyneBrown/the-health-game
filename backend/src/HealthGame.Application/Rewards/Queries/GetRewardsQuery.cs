using MediatR;

namespace HealthGame.Application.Rewards.Queries;

public sealed record GetRewardsQuery : IRequest<IReadOnlyCollection<RewardDto>>;
