using HealthGame.Domain.Common;

namespace HealthGame.Domain.Goals;

public sealed class ActivityEntry
{
    private ActivityEntry()
    {
    }

    public Guid Id { get; private set; }

    public Guid GoalId { get; private set; }

    public string UserId { get; private set; } = string.Empty;

    public DateTimeOffset OccurredAtUtc { get; private set; }

    public decimal Quantity { get; private set; }

    public string? Notes { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public DateTimeOffset? DeletedAtUtc { get; private set; }

    public bool IsDeleted => DeletedAtUtc.HasValue;

    public static ActivityEntry Create(
        Guid goalId,
        string userId,
        DateTimeOffset occurredAtUtc,
        decimal quantity,
        string? notes,
        DateTimeOffset createdAtUtc)
    {
        if (goalId == Guid.Empty)
        {
            throw new ArgumentException("Goal id is required.", nameof(goalId));
        }

        return new ActivityEntry
        {
            Id = Guid.NewGuid(),
            GoalId = goalId,
            UserId = Guard.Required(userId, nameof(userId), 128),
            OccurredAtUtc = occurredAtUtc.ToUniversalTime(),
            Quantity = Guard.Positive(quantity, nameof(quantity)),
            Notes = Guard.Optional(notes, nameof(notes), 1000),
            CreatedAtUtc = createdAtUtc.ToUniversalTime()
        };
    }

    public void Update(decimal quantity, string? notes, DateTimeOffset updatedAtUtc)
    {
        EnsureNotDeleted();

        Quantity = Guard.Positive(quantity, nameof(quantity));
        Notes = Guard.Optional(notes, nameof(notes), 1000);
        UpdatedAtUtc = updatedAtUtc.ToUniversalTime();
    }

    public void Delete(DateTimeOffset deletedAtUtc)
    {
        if (IsDeleted)
        {
            return;
        }

        DeletedAtUtc = deletedAtUtc.ToUniversalTime();
    }

    private void EnsureNotDeleted()
    {
        if (IsDeleted)
        {
            throw new InvalidOperationException("Deleted activity entries cannot be modified.");
        }
    }
}
