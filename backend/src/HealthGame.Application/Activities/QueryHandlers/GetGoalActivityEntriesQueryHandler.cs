using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Activities.Queries;
using HealthGame.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HealthGame.Application.Activities.QueryHandlers;

public sealed class GetGoalActivityEntriesQueryHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context) : IRequestHandler<GetGoalActivityEntriesQuery, IReadOnlyCollection<ActivityEntryDto>?>
{
    public async Task<IReadOnlyCollection<ActivityEntryDto>?> Handle(
        GetGoalActivityEntriesQuery request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var goalExists = await context.Goals
            .AsNoTracking()
            .AnyAsync(
                goal => goal.Id == request.GoalId
                    && goal.UserId == userId
                    && goal.DeletedAtUtc == null,
                cancellationToken);

        if (!goalExists)
        {
            return null;
        }

        var entries = await context.ActivityEntries
            .AsNoTracking()
            .Where(entry => entry.GoalId == request.GoalId
                && entry.UserId == userId
                && entry.DeletedAtUtc == null)
            .OrderBy(entry => entry.OccurredAtUtc)
            .ToArrayAsync(cancellationToken);

        return entries.Select(ActivityEntryDto.FromActivityEntry).ToArray();
    }
}
