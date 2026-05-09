using MediatR;

namespace HealthGame.Application.Activities.Commands;

public sealed record LogActivityCommand(
    Guid GoalId,
    DateTimeOffset OccurredAtUtc,
    decimal Quantity,
    string? Notes) : IRequest<ActivityEntryDto?>;
