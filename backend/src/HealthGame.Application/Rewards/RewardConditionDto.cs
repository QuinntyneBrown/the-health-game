using HealthGame.Domain.Goals;

namespace HealthGame.Application.Rewards;

public sealed record RewardConditionDto(RewardConditionType Type, int RequiredStreakCount)
{
    public static RewardConditionDto FromCondition(RewardCondition condition)
    {
        return new RewardConditionDto(condition.Type, condition.RequiredStreakCount);
    }

    public RewardCondition ToCondition()
    {
        return Type switch
        {
            RewardConditionType.GoalTargetMet => RewardCondition.ForGoalTargetMet(),
            RewardConditionType.StreakMilestone => RewardCondition.ForStreakMilestone(RequiredStreakCount),
            _ => throw new ArgumentOutOfRangeException(nameof(Type), "Reward condition type is not supported.")
        };
    }
}
