namespace HealthGame.Domain.Goals;

public static class StreakCalculator
{
    private const int MaxPeriodsToEvaluate = 100_000;

    public static StreakSummary Calculate(
        Goal goal,
        IEnumerable<ActivityEntry> activityEntries,
        DateTimeOffset asOfUtc,
        TimeZoneInfo timeZone)
    {
        ArgumentNullException.ThrowIfNull(goal);
        ArgumentNullException.ThrowIfNull(activityEntries);
        ArgumentNullException.ThrowIfNull(timeZone);

        var utcAsOf = asOfUtc.ToUniversalTime();
        var entries = activityEntries
            .Where(entry =>
                !entry.IsDeleted &&
                entry.GoalId == goal.Id &&
                entry.UserId == goal.UserId &&
                entry.OccurredAtUtc <= utcAsOf)
            .ToArray();

        var currentPeriod = goal.Cadence.GetPeriod(utcAsOf, goal.CreatedAtUtc, timeZone, goal.WeekStartsOn);
        var firstPeriod = goal.Cadence.GetPeriod(goal.CreatedAtUtc, goal.CreatedAtUtc, timeZone, goal.WeekStartsOn);

        return new StreakSummary(
            CalculateCurrentStreak(goal, entries, firstPeriod, currentPeriod, timeZone),
            CalculateLongestStreak(goal, entries, firstPeriod, currentPeriod, utcAsOf, timeZone));
    }

    public static bool IsTargetMet(
        Goal goal,
        IEnumerable<ActivityEntry> activityEntries,
        CadencePeriod period)
    {
        ArgumentNullException.ThrowIfNull(goal);
        ArgumentNullException.ThrowIfNull(activityEntries);
        ArgumentNullException.ThrowIfNull(period);

        var quantity = activityEntries
            .Where(entry =>
                !entry.IsDeleted &&
                entry.GoalId == goal.Id &&
                entry.UserId == goal.UserId &&
                period.Contains(entry.OccurredAtUtc))
            .Sum(entry => entry.Quantity);

        return quantity >= goal.TargetQuantity;
    }

    private static int CalculateCurrentStreak(
        Goal goal,
        IReadOnlyCollection<ActivityEntry> entries,
        CadencePeriod firstPeriod,
        CadencePeriod currentPeriod,
        TimeZoneInfo timeZone)
    {
        var cursor = currentPeriod;

        if (!IsTargetMet(goal, entries, cursor))
        {
            if (cursor.StartsAtUtc <= firstPeriod.StartsAtUtc)
            {
                return 0;
            }

            cursor = goal.Cadence.GetPreviousPeriod(cursor, goal.CreatedAtUtc, timeZone, goal.WeekStartsOn);
        }

        var currentStreak = 0;
        var evaluatedPeriods = 0;

        while (cursor.StartsAtUtc >= firstPeriod.StartsAtUtc)
        {
            if (++evaluatedPeriods > MaxPeriodsToEvaluate)
            {
                throw new InvalidOperationException("Too many cadence periods were evaluated while calculating the current streak.");
            }

            if (!IsTargetMet(goal, entries, cursor))
            {
                break;
            }

            currentStreak++;

            if (cursor.StartsAtUtc <= firstPeriod.StartsAtUtc)
            {
                break;
            }

            cursor = goal.Cadence.GetPreviousPeriod(cursor, goal.CreatedAtUtc, timeZone, goal.WeekStartsOn);
        }

        return currentStreak;
    }

    private static int CalculateLongestStreak(
        Goal goal,
        IReadOnlyCollection<ActivityEntry> entries,
        CadencePeriod firstPeriod,
        CadencePeriod currentPeriod,
        DateTimeOffset asOfUtc,
        TimeZoneInfo timeZone)
    {
        var longest = 0;
        var running = 0;
        var cursor = firstPeriod;
        var evaluatedPeriods = 0;

        while (cursor.StartsAtUtc <= currentPeriod.StartsAtUtc)
        {
            if (++evaluatedPeriods > MaxPeriodsToEvaluate)
            {
                throw new InvalidOperationException("Too many cadence periods were evaluated while calculating the longest streak.");
            }

            var targetMet = IsTargetMet(goal, entries, cursor);
            var isCurrentIncompletePeriod = cursor.StartsAtUtc == currentPeriod.StartsAtUtc && !cursor.IsCompleteAt(asOfUtc);

            if (targetMet)
            {
                running++;
                longest = Math.Max(longest, running);
            }
            else if (!isCurrentIncompletePeriod)
            {
                running = 0;
            }

            if (cursor.StartsAtUtc == currentPeriod.StartsAtUtc)
            {
                break;
            }

            cursor = goal.Cadence.GetNextPeriod(cursor, goal.CreatedAtUtc, timeZone, goal.WeekStartsOn);
        }

        return longest;
    }
}
