using System.ComponentModel.DataAnnotations;
using HealthGame.Application.Activities.Commands;

namespace HealthGame.Api.Contracts;

public sealed record LogActivityRequest(
    [property: Required]
    DateTimeOffset OccurredAtUtc,

    [property: Range(0.0001, 1_000_000_000)]
    decimal Quantity,

    [property: StringLength(1000)]
    string? Notes)
{
    public LogActivityCommand ToCommand(Guid goalId)
    {
        return new LogActivityCommand(goalId, OccurredAtUtc, Quantity, Notes);
    }
}
