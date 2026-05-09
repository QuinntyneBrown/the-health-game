using HealthGame.Domain.Goals;

namespace HealthGame.Application.Goals;

public sealed record GoalDto(
    Guid Id,
    string Name,
    string? Description,
    decimal TargetQuantity,
    string TargetUnit,
    GoalCadenceDto Cadence,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc)
{
    public static GoalDto FromGoal(Goal goal)
    {
        return new GoalDto(
            goal.Id,
            goal.Name,
            goal.Description,
            goal.TargetQuantity,
            goal.TargetUnit,
            new GoalCadenceDto(goal.Cadence.Type, goal.Cadence.Interval),
            goal.CreatedAtUtc,
            goal.UpdatedAtUtc);
    }
}
