using HealthGame.Domain.Goals;

namespace HealthGame.Api.Contracts;

public sealed record GoalCadenceRequest(
    GoalCadenceType Type,
    int Interval = 1);
