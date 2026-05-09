using MediatR;

namespace HealthGame.Application.Goals.Queries;

public sealed record GetGoalByIdQuery(Guid GoalId) : IRequest<GoalDto?>;
