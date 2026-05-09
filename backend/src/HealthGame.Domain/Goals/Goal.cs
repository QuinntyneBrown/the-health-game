using HealthGame.Domain.Common;

namespace HealthGame.Domain.Goals;

public sealed class Goal
{
    private readonly List<ActivityEntry> _activityEntries = [];
    private readonly List<Reward> _rewards = [];

    private Goal()
    {
    }

    public Guid Id { get; private set; }

    public string UserId { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public decimal TargetQuantity { get; private set; }

    public string TargetUnit { get; private set; } = string.Empty;

    public GoalCadence Cadence { get; private set; } = GoalCadence.Create(GoalCadenceType.Daily);

    public string TimeZoneId { get; private set; } = "UTC";

    public DayOfWeek WeekStartsOn { get; private set; } = DayOfWeek.Monday;

    public IReadOnlyCollection<ActivityEntry> ActivityEntries => _activityEntries.AsReadOnly();

    public IReadOnlyCollection<Reward> Rewards => _rewards.AsReadOnly();

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public DateTimeOffset? DeletedAtUtc { get; private set; }

    public bool IsDeleted => DeletedAtUtc.HasValue;

    public static Goal Create(
        string userId,
        string name,
        string? description,
        decimal targetQuantity,
        string targetUnit,
        GoalCadence cadence,
        DateTimeOffset createdAtUtc)
    {
        return Create(
            userId,
            name,
            description,
            targetQuantity,
            targetUnit,
            cadence,
            "UTC",
            DayOfWeek.Monday,
            createdAtUtc);
    }

    public static Goal Create(
        string userId,
        string name,
        string? description,
        decimal targetQuantity,
        string targetUnit,
        GoalCadence cadence,
        string timeZoneId,
        DayOfWeek weekStartsOn,
        DateTimeOffset createdAtUtc)
    {
        Validate(userId, name, targetQuantity, targetUnit, cadence);
        EnsureDefinedWeekStart(weekStartsOn);

        return new Goal
        {
            Id = Guid.NewGuid(),
            UserId = Guard.Required(userId, nameof(userId), 128),
            Name = Guard.Required(name, nameof(name), 120),
            Description = Guard.Optional(description, nameof(description), 500),
            TargetQuantity = targetQuantity,
            TargetUnit = Guard.Required(targetUnit, nameof(targetUnit), 32),
            Cadence = cadence,
            TimeZoneId = Guard.Required(timeZoneId, nameof(timeZoneId), 128),
            WeekStartsOn = weekStartsOn,
            CreatedAtUtc = createdAtUtc.ToUniversalTime()
        };
    }

    public void Update(
        string name,
        string? description,
        decimal targetQuantity,
        string targetUnit,
        GoalCadence cadence,
        DateTimeOffset updatedAtUtc)
    {
        EnsureActive();
        Validate(UserId, name, targetQuantity, targetUnit, cadence);

        Name = Guard.Required(name, nameof(name), 120);
        Description = Guard.Optional(description, nameof(description), 500);
        TargetQuantity = targetQuantity;
        TargetUnit = Guard.Required(targetUnit, nameof(targetUnit), 32);
        Cadence = cadence;
        UpdatedAtUtc = updatedAtUtc.ToUniversalTime();
    }

    public void UpdateSchedule(string timeZoneId, DayOfWeek weekStartsOn, DateTimeOffset updatedAtUtc)
    {
        EnsureActive();
        EnsureDefinedWeekStart(weekStartsOn);

        TimeZoneId = Guard.Required(timeZoneId, nameof(timeZoneId), 128);
        WeekStartsOn = weekStartsOn;
        UpdatedAtUtc = updatedAtUtc.ToUniversalTime();
    }

    public ActivityEntry LogActivity(
        DateTimeOffset occurredAtUtc,
        decimal quantity,
        string? notes,
        DateTimeOffset loggedAtUtc,
        TimeZoneInfo timeZone)
    {
        EnsureActive();
        ArgumentNullException.ThrowIfNull(timeZone);

        var currentPeriod = Cadence.GetPeriod(loggedAtUtc, CreatedAtUtc, timeZone, WeekStartsOn);

        if (occurredAtUtc.ToUniversalTime() >= currentPeriod.EndsAtUtc)
        {
            throw new ArgumentOutOfRangeException(nameof(occurredAtUtc), "Activity cannot be logged beyond the current cadence window.");
        }

        var activityEntry = ActivityEntry.Create(Id, UserId, occurredAtUtc, quantity, notes, loggedAtUtc);

        _activityEntries.Add(activityEntry);

        return activityEntry;
    }

    public void UpdateActivityEntry(
        Guid activityEntryId,
        decimal quantity,
        string? notes,
        DateTimeOffset updatedAtUtc)
    {
        EnsureActive();
        FindActivityEntry(activityEntryId).Update(quantity, notes, updatedAtUtc);
    }

    public void DeleteActivityEntry(Guid activityEntryId, DateTimeOffset deletedAtUtc)
    {
        EnsureActive();
        FindActivityEntry(activityEntryId).Delete(deletedAtUtc);
    }

    public IReadOnlyCollection<ActivityEntry> GetActivityHistory()
    {
        return _activityEntries
            .Where(entry => !entry.IsDeleted)
            .OrderBy(entry => entry.OccurredAtUtc)
            .ToArray();
    }

    public Reward DefineReward(
        string name,
        string? description,
        RewardCondition condition,
        DateTimeOffset createdAtUtc)
    {
        EnsureActive();

        var reward = Reward.Create(Id, UserId, name, description, condition, createdAtUtc);

        _rewards.Add(reward);

        return reward;
    }

    public IReadOnlyCollection<Reward> EvaluateRewards(StreakSummary streak, DateTimeOffset earnedAtUtc)
    {
        ArgumentNullException.ThrowIfNull(streak);

        return _rewards
            .Where(reward => reward.TryMarkEarned(streak, earnedAtUtc))
            .ToArray();
    }

    public StreakSummary CalculateStreak(DateTimeOffset asOfUtc, TimeZoneInfo timeZone)
    {
        return StreakCalculator.Calculate(this, _activityEntries, asOfUtc, timeZone);
    }

    public void Delete(DateTimeOffset deletedAtUtc)
    {
        if (IsDeleted)
        {
            return;
        }

        DeletedAtUtc = deletedAtUtc.ToUniversalTime();
    }

    private static void Validate(
        string userId,
        string name,
        decimal targetQuantity,
        string targetUnit,
        GoalCadence cadence)
    {
        Guard.Required(userId, nameof(userId), 128);
        Guard.Required(name, nameof(name), 120);
        Guard.Required(targetUnit, nameof(targetUnit), 32);
        ArgumentNullException.ThrowIfNull(cadence);
        Guard.Positive(targetQuantity, nameof(targetQuantity));
    }

    private static void EnsureDefinedWeekStart(DayOfWeek weekStartsOn)
    {
        if (!Enum.IsDefined(weekStartsOn))
        {
            throw new ArgumentOutOfRangeException(nameof(weekStartsOn), "Week start day is not supported.");
        }
    }

    private ActivityEntry FindActivityEntry(Guid activityEntryId)
    {
        var activityEntry = _activityEntries.FirstOrDefault(entry => entry.Id == activityEntryId);

        return activityEntry ?? throw new InvalidOperationException("Activity entry does not belong to this goal.");
    }

    private void EnsureActive()
    {
        if (IsDeleted)
        {
            throw new InvalidOperationException("Deleted goals cannot be modified.");
        }
    }
}
