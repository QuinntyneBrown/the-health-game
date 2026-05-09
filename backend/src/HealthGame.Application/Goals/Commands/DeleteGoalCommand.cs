using MediatR;

namespace HealthGame.Application.Goals.Commands;

public sealed record DeleteGoalCommand(Guid GoalId) : IRequest<bool>;
