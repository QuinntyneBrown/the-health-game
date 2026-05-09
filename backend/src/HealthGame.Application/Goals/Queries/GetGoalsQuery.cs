using MediatR;

namespace HealthGame.Application.Goals.Queries;

public sealed record GetGoalsQuery : IRequest<IReadOnlyCollection<GoalDto>>;
