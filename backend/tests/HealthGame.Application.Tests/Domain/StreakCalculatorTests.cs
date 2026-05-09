// Acceptance Test
// Traces to: L2-007, L2-008
// Description: Current/longest streak rules — incomplete current period, missed periods, longest preservation.

using HealthGame.Domain.Goals;

namespace HealthGame.Application.Tests.Domain;

public sealed class StreakCalculatorTests
{
    private static Goal NewDailyGoal(DateTimeOffset createdAt)
    {
        return Goal.Create(
            "user-1",
            "Walk",
            null,
            1m,
            "session",
            GoalCadence.Create(GoalCadenceType.Daily),
            "UTC",
            DayOfWeek.Monday,
            createdAt);
    }

    [Fact]
    public void Current_streak_counts_consecutive_met_days()
    {
        var created = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var goal = NewDailyGoal(created);

        for (var day = 0; day < 3; day++)
        {
            var occurredAt = created.AddDays(day).AddHours(12);
            goal.LogActivity(occurredAt, 1m, null, occurredAt, TimeZoneInfo.Utc);
        }

        var asOf = created.AddDays(2).AddHours(23);
        var summary = goal.CalculateStreak(asOf, TimeZoneInfo.Utc);

        Assert.Equal(3, summary.CurrentStreak);
        Assert.Equal(3, summary.LongestStreak);
    }

    [Fact]
    public void Missed_completed_period_resets_current_but_preserves_longest()
    {
        var created = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var goal = NewDailyGoal(created);

        for (var day = 0; day < 3; day++)
        {
            var occurredAt = created.AddDays(day).AddHours(12);
            goal.LogActivity(occurredAt, 1m, null, occurredAt, TimeZoneInfo.Utc);
        }

        var asOf = created.AddDays(5).AddHours(23);
        var summary = goal.CalculateStreak(asOf, TimeZoneInfo.Utc);

        Assert.Equal(0, summary.CurrentStreak);
        Assert.Equal(3, summary.LongestStreak);
    }

    [Fact]
    public void Incomplete_current_period_does_not_break_streak()
    {
        var created = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var goal = NewDailyGoal(created);

        var dayOne = created.AddHours(12);
        goal.LogActivity(dayOne, 1m, null, dayOne, TimeZoneInfo.Utc);

        var dayTwoMorning = created.AddDays(1).AddHours(8);
        var summary = goal.CalculateStreak(dayTwoMorning, TimeZoneInfo.Utc);

        Assert.Equal(1, summary.CurrentStreak);
        Assert.Equal(1, summary.LongestStreak);
    }
}
