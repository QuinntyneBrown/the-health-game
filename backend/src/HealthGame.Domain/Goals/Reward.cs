using HealthGame.Domain.Common;

namespace HealthGame.Domain.Goals;

public sealed class Reward
{
    private Reward()
    {
    }

    public Guid Id { get; private set; }

    public Guid GoalId { get; private set; }

    public string UserId { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public RewardCondition Condition { get; private set; } = RewardCondition.ForGoalTargetMet();

    public bool IsEarned { get; private set; }

    public DateTimeOffset? EarnedAtUtc { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public static Reward Create(
        Guid goalId,
        string userId,
        string name,
        string? description,
        RewardCondition condition,
        DateTimeOffset createdAtUtc)
    {
        if (goalId == Guid.Empty)
        {
            throw new ArgumentException("Goal id is required.", nameof(goalId));
        }

        ArgumentNullException.ThrowIfNull(condition);

        return new Reward
        {
            Id = Guid.NewGuid(),
            GoalId = goalId,
            UserId = Guard.Required(userId, nameof(userId), 128),
            Name = Guard.Required(name, nameof(name), 120),
            Description = Guard.Optional(description, nameof(description), 500),
            Condition = condition,
            CreatedAtUtc = createdAtUtc.ToUniversalTime()
        };
    }

    public void Update(
        string name,
        string? description,
        RewardCondition condition,
        DateTimeOffset updatedAtUtc)
    {
        ArgumentNullException.ThrowIfNull(condition);

        Name = Guard.Required(name, nameof(name), 120);
        Description = Guard.Optional(description, nameof(description), 500);
        Condition = condition;
        UpdatedAtUtc = updatedAtUtc.ToUniversalTime();
    }

    public bool TryMarkEarned(StreakSummary streak, DateTimeOffset earnedAtUtc)
    {
        if (IsEarned || !Condition.IsSatisfiedBy(streak))
        {
            return false;
        }

        IsEarned = true;
        EarnedAtUtc = earnedAtUtc.ToUniversalTime();

        return true;
    }
}
