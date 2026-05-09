using System.ComponentModel.DataAnnotations;
using HealthGame.Application.Activities.Commands;

namespace HealthGame.Api.Contracts;

public sealed record UpdateActivityEntryRequest(
    [property: Range(0.0001, 1_000_000_000)]
    decimal Quantity,

    [property: StringLength(1000)]
    string? Notes)
{
    public UpdateActivityEntryCommand ToCommand(Guid goalId, Guid activityEntryId)
    {
        return new UpdateActivityEntryCommand(goalId, activityEntryId, Quantity, Notes);
    }
}
