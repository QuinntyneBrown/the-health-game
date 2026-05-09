namespace HealthGame.Domain.Goals;

public sealed class RewardCondition
{
    private RewardCondition()
    {
    }

    private RewardCondition(RewardConditionType type, int requiredStreakCount)
    {
        Type = type;
        RequiredStreakCount = requiredStreakCount;
    }

    public RewardConditionType Type { get; private set; }

    public int RequiredStreakCount { get; private set; }

    public static RewardCondition ForGoalTargetMet()
    {
        return new RewardCondition(RewardConditionType.GoalTargetMet, 1);
    }

    public static RewardCondition ForStreakMilestone(int requiredStreakCount)
    {
        if (requiredStreakCount < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(requiredStreakCount), "Streak threshold must be greater than zero.");
        }

        return new RewardCondition(RewardConditionType.StreakMilestone, requiredStreakCount);
    }

    public bool IsSatisfiedBy(StreakSummary streak)
    {
        return Type switch
        {
            RewardConditionType.GoalTargetMet => streak.CurrentStreak >= 1,
            RewardConditionType.StreakMilestone => streak.CurrentStreak >= RequiredStreakCount,
            _ => throw new ArgumentOutOfRangeException(nameof(Type), "Reward condition type is not supported.")
        };
    }
}
