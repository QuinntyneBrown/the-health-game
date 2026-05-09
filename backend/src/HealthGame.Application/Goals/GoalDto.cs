using HealthGame.Domain.Goals;

namespace HealthGame.Application.Goals;

public sealed record GoalDto(
    Guid Id,
    string Name,
    string? Description,
    decimal TargetQuantity,
    string TargetUnit,
    GoalCadenceDto Cadence,
    string TimeZoneId,
    DayOfWeek WeekStartsOn,
    StreakSummaryDto Streak,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc)
{
    public static GoalDto FromGoal(Goal goal, StreakSummaryDto? streak = null)
    {
        return new GoalDto(
            goal.Id,
            goal.Name,
            goal.Description,
            goal.TargetQuantity,
            goal.TargetUnit,
            new GoalCadenceDto(goal.Cadence.Type, goal.Cadence.Interval),
            goal.TimeZoneId,
            goal.WeekStartsOn,
            streak ?? StreakSummaryDto.Empty,
            goal.CreatedAtUtc,
            goal.UpdatedAtUtc);
    }
}
