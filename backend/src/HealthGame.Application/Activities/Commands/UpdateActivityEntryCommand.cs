using MediatR;

namespace HealthGame.Application.Activities.Commands;

public sealed record UpdateActivityEntryCommand(
    Guid GoalId,
    Guid ActivityEntryId,
    decimal Quantity,
    string? Notes) : IRequest<ActivityEntryDto?>;
