using HealthGame.Application.Activities.Commands;

namespace HealthGame.Api.Contracts;

public sealed record UpdateActivityEntryRequest(
    decimal Quantity,
    string? Notes)
{
    public UpdateActivityEntryCommand ToCommand(Guid goalId, Guid activityEntryId)
    {
        return new UpdateActivityEntryCommand(goalId, activityEntryId, Quantity, Notes);
    }
}
