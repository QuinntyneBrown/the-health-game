using HealthGame.Application.Goals;
using HealthGame.Application.Goals.Commands;

namespace HealthGame.Api.Contracts;

public sealed record CreateGoalRequest(
    string Name,
    string? Description,
    decimal TargetQuantity,
    string TargetUnit,
    GoalCadenceRequest Cadence,
    string? TimeZoneId = null,
    DayOfWeek? WeekStartsOn = null)
{
    public CreateGoalCommand ToCommand()
    {
        return new CreateGoalCommand(
            Name,
            Description,
            TargetQuantity,
            TargetUnit,
            new GoalCadenceDto(Cadence.Type, Cadence.Interval),
            TimeZoneId,
            WeekStartsOn);
    }
}
