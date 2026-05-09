namespace HealthGame.Domain.Goals;

public sealed record StreakSummary
{
    public StreakSummary(int currentStreak, int longestStreak)
    {
        if (currentStreak < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(currentStreak));
        }

        if (longestStreak < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(longestStreak));
        }

        CurrentStreak = currentStreak;
        LongestStreak = longestStreak;
    }

    public int CurrentStreak { get; }

    public int LongestStreak { get; }
}
