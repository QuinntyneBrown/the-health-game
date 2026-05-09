using System.ComponentModel.DataAnnotations;
using HealthGame.Domain.Goals;

namespace HealthGame.Api.Contracts;

public sealed record RewardConditionRequest(
    RewardConditionType Type,

    [property: Range(1, int.MaxValue)]
    int RequiredStreakCount = 1);
