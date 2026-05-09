namespace HealthGame.Domain.Goals;

public sealed class GoalCadence
{
    private GoalCadence()
    {
    }

    private GoalCadence(GoalCadenceType type, int interval)
    {
        Type = type;
        Interval = interval;
    }

    public GoalCadenceType Type { get; private set; }

    public int Interval { get; private set; } = 1;

    public bool IsCustom => Type is GoalCadenceType.CustomHours or GoalCadenceType.CustomDays;

    public CadencePeriod GetPeriod(
        DateTimeOffset instantUtc,
        DateTimeOffset anchorUtc,
        TimeZoneInfo timeZone,
        DayOfWeek weekStartsOn)
    {
        ArgumentNullException.ThrowIfNull(timeZone);

        var instantLocal = TimeZoneInfo.ConvertTime(instantUtc, timeZone).DateTime;
        var anchorLocal = TimeZoneInfo.ConvertTime(anchorUtc, timeZone).DateTime;

        return Type switch
        {
            GoalCadenceType.Hourly => BuildPeriod(
                new DateTime(instantLocal.Year, instantLocal.Month, instantLocal.Day, instantLocal.Hour, 0, 0),
                timeZone,
                TimeSpan.FromHours(1)),
            GoalCadenceType.Daily => BuildPeriod(instantLocal.Date, timeZone, TimeSpan.FromDays(1)),
            GoalCadenceType.Weekly => BuildPeriod(GetWeekStart(instantLocal.Date, weekStartsOn), timeZone, TimeSpan.FromDays(7)),
            GoalCadenceType.Monthly => BuildPeriod(
                new DateTime(instantLocal.Year, instantLocal.Month, 1),
                new DateTime(instantLocal.Year, instantLocal.Month, 1).AddMonths(1),
                timeZone),
            GoalCadenceType.CustomHours => BuildCustomPeriod(anchorLocal, instantLocal, timeZone, TimeSpan.FromHours(Interval)),
            GoalCadenceType.CustomDays => BuildCustomPeriod(anchorLocal, instantLocal, timeZone, TimeSpan.FromDays(Interval)),
            _ => throw new ArgumentOutOfRangeException(nameof(Type), "Goal cadence type is not supported.")
        };
    }

    public CadencePeriod GetNextPeriod(
        CadencePeriod period,
        DateTimeOffset anchorUtc,
        TimeZoneInfo timeZone,
        DayOfWeek weekStartsOn)
    {
        return GetPeriod(period.EndsAtUtc, anchorUtc, timeZone, weekStartsOn);
    }

    public CadencePeriod GetPreviousPeriod(
        CadencePeriod period,
        DateTimeOffset anchorUtc,
        TimeZoneInfo timeZone,
        DayOfWeek weekStartsOn)
    {
        return GetPeriod(period.StartsAtUtc.AddTicks(-1), anchorUtc, timeZone, weekStartsOn);
    }

    public static GoalCadence Create(GoalCadenceType type, int interval = 1)
    {
        if (!Enum.IsDefined(type))
        {
            throw new ArgumentOutOfRangeException(nameof(type), "Goal cadence type is not supported.");
        }

        if (interval < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(interval), "Goal cadence interval must be greater than zero.");
        }

        if (type is not (GoalCadenceType.CustomHours or GoalCadenceType.CustomDays))
        {
            interval = 1;
        }

        return new GoalCadence(type, interval);
    }

    private static CadencePeriod BuildCustomPeriod(
        DateTime anchorLocal,
        DateTime instantLocal,
        TimeZoneInfo timeZone,
        TimeSpan interval)
    {
        if (instantLocal < anchorLocal)
        {
            return BuildPeriod(anchorLocal, anchorLocal.Add(interval), timeZone);
        }

        var elapsedPeriods = (long)((instantLocal - anchorLocal).Ticks / interval.Ticks);
        var startsAt = anchorLocal.AddTicks(elapsedPeriods * interval.Ticks);

        return BuildPeriod(startsAt, startsAt.Add(interval), timeZone);
    }

    private static CadencePeriod BuildPeriod(DateTime startsAtLocal, TimeZoneInfo timeZone, TimeSpan duration)
    {
        return BuildPeriod(startsAtLocal, startsAtLocal.Add(duration), timeZone);
    }

    private static CadencePeriod BuildPeriod(DateTime startsAtLocal, DateTime endsAtLocal, TimeZoneInfo timeZone)
    {
        return new CadencePeriod(ToUtc(startsAtLocal, timeZone), ToUtc(endsAtLocal, timeZone));
    }

    private static DateTimeOffset ToUtc(DateTime localTime, TimeZoneInfo timeZone)
    {
        var unspecifiedLocal = DateTime.SpecifyKind(localTime, DateTimeKind.Unspecified);

        while (timeZone.IsInvalidTime(unspecifiedLocal))
        {
            unspecifiedLocal = unspecifiedLocal.AddMinutes(1);
        }

        var offset = timeZone.IsAmbiguousTime(unspecifiedLocal)
            ? timeZone.GetAmbiguousTimeOffsets(unspecifiedLocal).Max()
            : timeZone.GetUtcOffset(unspecifiedLocal);

        return new DateTimeOffset(unspecifiedLocal, offset).ToUniversalTime();
    }

    private static DateTime GetWeekStart(DateTime date, DayOfWeek weekStartsOn)
    {
        var daysSinceWeekStart = ((int)date.DayOfWeek - (int)weekStartsOn + 7) % 7;

        return date.AddDays(-daysSinceWeekStart);
    }
}
