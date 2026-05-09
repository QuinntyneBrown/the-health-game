using HealthGame.Domain.Goals;

namespace HealthGame.Application.Goals;

public sealed record StreakSummaryDto(int CurrentStreak, int LongestStreak)
{
    public static StreakSummaryDto Empty { get; } = new(0, 0);

    public static StreakSummaryDto FromStreakSummary(StreakSummary summary)
    {
        return new StreakSummaryDto(summary.CurrentStreak, summary.LongestStreak);
    }
}
