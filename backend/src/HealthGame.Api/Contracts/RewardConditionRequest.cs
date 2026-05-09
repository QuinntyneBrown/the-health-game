using HealthGame.Domain.Goals;

namespace HealthGame.Api.Contracts;

public sealed record RewardConditionRequest(
    RewardConditionType Type,
    int RequiredStreakCount = 1);
