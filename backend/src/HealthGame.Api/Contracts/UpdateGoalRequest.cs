using HealthGame.Application.Goals;
using HealthGame.Application.Goals.Commands;

namespace HealthGame.Api.Contracts;

public sealed record UpdateGoalRequest(
    string Name,
    string? Description,
    decimal TargetQuantity,
    string TargetUnit,
    GoalCadenceRequest Cadence,
    string? TimeZoneId = null,
    DayOfWeek? WeekStartsOn = null)
{
    public UpdateGoalCommand ToCommand(Guid goalId)
    {
        return new UpdateGoalCommand(
            goalId,
            Name,
            Description,
            TargetQuantity,
            TargetUnit,
            new GoalCadenceDto(Cadence.Type, Cadence.Interval),
            TimeZoneId,
            WeekStartsOn);
    }
}
