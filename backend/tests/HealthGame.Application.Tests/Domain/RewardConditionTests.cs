// Acceptance Test
// Traces to: L2-009, L2-010
// Description: Reward conditions evaluate correctly for goal-target and streak-milestone types.

using HealthGame.Domain.Goals;

namespace HealthGame.Application.Tests.Domain;

public sealed class RewardConditionTests
{
    [Fact]
    public void Goal_target_met_satisfied_when_streak_at_least_one()
    {
        var condition = RewardCondition.ForGoalTargetMet();

        Assert.True(condition.IsSatisfiedBy(new StreakSummary(1, 1)));
        Assert.False(condition.IsSatisfiedBy(new StreakSummary(0, 5)));
    }

    [Fact]
    public void Streak_milestone_satisfied_when_current_streak_meets_required()
    {
        var condition = RewardCondition.ForStreakMilestone(7);

        Assert.True(condition.IsSatisfiedBy(new StreakSummary(7, 10)));
        Assert.False(condition.IsSatisfiedBy(new StreakSummary(6, 6)));
    }

    [Fact]
    public void Streak_milestone_with_zero_throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => RewardCondition.ForStreakMilestone(0));
    }

    [Fact]
    public void Reward_remains_earned_after_streak_break()
    {
        var reward = Reward.Create(
            Guid.NewGuid(),
            "user-1",
            "Snack",
            null,
            RewardCondition.ForGoalTargetMet(),
            DateTimeOffset.UtcNow);

        reward.TryMarkEarned(new StreakSummary(1, 1), DateTimeOffset.UtcNow);

        Assert.True(reward.IsEarned);
        Assert.NotNull(reward.EarnedAtUtc);

        // Later evaluation does not unmark.
        reward.TryMarkEarned(new StreakSummary(0, 1), DateTimeOffset.UtcNow);
        Assert.True(reward.IsEarned);
    }
}
