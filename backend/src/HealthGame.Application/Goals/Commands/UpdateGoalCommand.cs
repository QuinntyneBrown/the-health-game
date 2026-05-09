using MediatR;

namespace HealthGame.Application.Goals.Commands;

public sealed record UpdateGoalCommand(
    Guid GoalId,
    string Name,
    string? Description,
    decimal TargetQuantity,
    string TargetUnit,
    GoalCadenceDto Cadence,
    string? TimeZoneId,
    DayOfWeek? WeekStartsOn) : IRequest<GoalDto?>;
