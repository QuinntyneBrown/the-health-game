// Acceptance Test
// Traces to: L2-011, L2-012
// Description: Cadence period boundaries for daily, weekly, hourly, and custom cadences.

using HealthGame.Domain.Goals;

namespace HealthGame.Application.Tests.Domain;

public sealed class GoalCadenceTests
{
    [Fact]
    public void Daily_period_spans_one_local_day()
    {
        var cadence = GoalCadence.Create(GoalCadenceType.Daily);
        var anchor = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var instant = new DateTimeOffset(2026, 1, 5, 12, 30, 0, TimeSpan.Zero);

        var period = cadence.GetPeriod(instant, anchor, TimeZoneInfo.Utc, DayOfWeek.Monday);

        Assert.Equal(new DateTimeOffset(2026, 1, 5, 0, 0, 0, TimeSpan.Zero), period.StartsAtUtc);
        Assert.Equal(new DateTimeOffset(2026, 1, 6, 0, 0, 0, TimeSpan.Zero), period.EndsAtUtc);
    }

    [Fact]
    public void Weekly_period_starts_on_configured_day()
    {
        var cadence = GoalCadence.Create(GoalCadenceType.Weekly);
        var anchor = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var instant = new DateTimeOffset(2026, 1, 7, 12, 0, 0, TimeSpan.Zero);

        var period = cadence.GetPeriod(instant, anchor, TimeZoneInfo.Utc, DayOfWeek.Monday);

        Assert.Equal(DayOfWeek.Monday, period.StartsAtUtc.DayOfWeek);
    }

    [Fact]
    public void Hourly_period_spans_one_hour()
    {
        var cadence = GoalCadence.Create(GoalCadenceType.Hourly);
        var anchor = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var instant = new DateTimeOffset(2026, 1, 1, 9, 30, 0, TimeSpan.Zero);

        var period = cadence.GetPeriod(instant, anchor, TimeZoneInfo.Utc, DayOfWeek.Monday);

        Assert.Equal(TimeSpan.FromHours(1), period.EndsAtUtc - period.StartsAtUtc);
    }

    [Fact]
    public void Custom_days_period_aligns_to_anchor()
    {
        var cadence = GoalCadence.Create(GoalCadenceType.CustomDays, interval: 3);
        var anchor = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var instant = new DateTimeOffset(2026, 1, 7, 12, 0, 0, TimeSpan.Zero);

        var period = cadence.GetPeriod(instant, anchor, TimeZoneInfo.Utc, DayOfWeek.Monday);

        Assert.Equal(new DateTimeOffset(2026, 1, 7, 0, 0, 0, TimeSpan.Zero), period.StartsAtUtc);
        Assert.Equal(new DateTimeOffset(2026, 1, 10, 0, 0, 0, TimeSpan.Zero), period.EndsAtUtc);
    }

    [Fact]
    public void Create_with_zero_interval_throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            GoalCadence.Create(GoalCadenceType.CustomDays, interval: 0));
    }
}
