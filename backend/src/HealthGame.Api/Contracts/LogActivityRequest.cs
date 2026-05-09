using HealthGame.Application.Activities.Commands;

namespace HealthGame.Api.Contracts;

public sealed record LogActivityRequest(
    DateTimeOffset OccurredAtUtc,
    decimal Quantity,
    string? Notes)
{
    public LogActivityCommand ToCommand(Guid goalId)
    {
        return new LogActivityCommand(goalId, OccurredAtUtc, Quantity, Notes);
    }
}
