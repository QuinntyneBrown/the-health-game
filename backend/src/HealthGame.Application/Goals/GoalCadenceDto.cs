using HealthGame.Domain.Goals;

namespace HealthGame.Application.Goals;

public sealed record GoalCadenceDto(GoalCadenceType Type, int Interval);
