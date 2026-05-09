using MediatR;

namespace HealthGame.Application.Goals.Commands;

public sealed record CreateGoalCommand(
    string Name,
    string? Description,
    decimal TargetQuantity,
    string TargetUnit,
    GoalCadenceDto Cadence) : IRequest<GoalDto>;
