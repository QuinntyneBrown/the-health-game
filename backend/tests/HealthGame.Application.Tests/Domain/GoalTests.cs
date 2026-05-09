// Acceptance Test
// Traces to: L2-001
// Description: Goal creation enforces required fields and produces a valid aggregate.

using HealthGame.Domain.Goals;

namespace HealthGame.Application.Tests.Domain;

public sealed class GoalTests
{
    [Fact]
    public void Create_with_valid_input_produces_active_goal()
    {
        var goal = Goal.Create(
            "user-1",
            "Walk",
            "Daily walk",
            5m,
            "km",
            GoalCadence.Create(GoalCadenceType.Daily),
            DateTimeOffset.UtcNow);

        Assert.NotEqual(Guid.Empty, goal.Id);
        Assert.Equal("Walk", goal.Name);
        Assert.False(goal.IsDeleted);
    }

    [Fact]
    public void Create_with_blank_name_throws()
    {
        Assert.Throws<ArgumentException>(() => Goal.Create(
            "user-1",
            "  ",
            null,
            5m,
            "km",
            GoalCadence.Create(GoalCadenceType.Daily),
            DateTimeOffset.UtcNow));
    }

    [Fact]
    public void Create_with_zero_target_throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => Goal.Create(
            "user-1",
            "Walk",
            null,
            0m,
            "km",
            GoalCadence.Create(GoalCadenceType.Daily),
            DateTimeOffset.UtcNow));
    }

    [Fact]
    public void Update_after_delete_throws()
    {
        var goal = Goal.Create(
            "user-1",
            "Walk",
            null,
            5m,
            "km",
            GoalCadence.Create(GoalCadenceType.Daily),
            DateTimeOffset.UtcNow);

        goal.Delete(DateTimeOffset.UtcNow);

        Assert.Throws<InvalidOperationException>(() => goal.Update(
            "Run",
            null,
            5m,
            "km",
            GoalCadence.Create(GoalCadenceType.Daily),
            DateTimeOffset.UtcNow));
    }
}
