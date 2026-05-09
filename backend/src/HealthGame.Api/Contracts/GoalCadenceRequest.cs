using System.ComponentModel.DataAnnotations;
using HealthGame.Domain.Goals;

namespace HealthGame.Api.Contracts;

public sealed record GoalCadenceRequest(
    GoalCadenceType Type,

    [property: Range(1, int.MaxValue)]
    int Interval = 1);
