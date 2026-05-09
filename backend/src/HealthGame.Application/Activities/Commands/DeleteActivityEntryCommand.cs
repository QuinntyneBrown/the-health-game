using MediatR;

namespace HealthGame.Application.Activities.Commands;

public sealed record DeleteActivityEntryCommand(
    Guid GoalId,
    Guid ActivityEntryId) : IRequest<bool>;
