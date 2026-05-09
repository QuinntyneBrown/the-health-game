using HealthGame.Domain.Goals;

namespace HealthGame.Application.Activities;

public sealed record ActivityEntryDto(
    Guid Id,
    Guid GoalId,
    DateTimeOffset OccurredAtUtc,
    decimal Quantity,
    string? Notes,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc)
{
    public static ActivityEntryDto FromActivityEntry(ActivityEntry entry)
    {
        return new ActivityEntryDto(
            entry.Id,
            entry.GoalId,
            entry.OccurredAtUtc,
            entry.Quantity,
            entry.Notes,
            entry.CreatedAtUtc,
            entry.UpdatedAtUtc);
    }
}
