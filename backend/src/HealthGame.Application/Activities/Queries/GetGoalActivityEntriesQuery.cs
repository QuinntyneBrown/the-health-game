using MediatR;

namespace HealthGame.Application.Activities.Queries;

public sealed record GetGoalActivityEntriesQuery(Guid GoalId) : IRequest<IReadOnlyCollection<ActivityEntryDto>?>;
