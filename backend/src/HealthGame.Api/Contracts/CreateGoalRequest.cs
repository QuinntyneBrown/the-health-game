using System.ComponentModel.DataAnnotations;
using HealthGame.Application.Goals;
using HealthGame.Application.Goals.Commands;

namespace HealthGame.Api.Contracts;

public sealed record CreateGoalRequest(
    [property: Required]
    [property: StringLength(120)]
    string Name,

    [property: StringLength(500)]
    string? Description,

    [property: Range(0.0001, 1_000_000_000)]
    decimal TargetQuantity,

    [property: Required]
    [property: StringLength(32)]
    string TargetUnit,

    [property: Required]
    GoalCadenceRequest Cadence)
{
    public CreateGoalCommand ToCommand()
    {
        return new CreateGoalCommand(
            Name,
            Description,
            TargetQuantity,
            TargetUnit,
            new GoalCadenceDto(Cadence.Type, Cadence.Interval));
    }
}
