using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Common;
using HealthGame.Application.Goals.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HealthGame.Application.Goals.QueryHandlers;

public sealed class GetGoalsQueryHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context) : IRequestHandler<GetGoalsQuery, IReadOnlyCollection<GoalDto>>
{
    public async Task<IReadOnlyCollection<GoalDto>> Handle(GetGoalsQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();
        var userGoals = await context.Goals
            .AsNoTracking()
            .Where(goal => goal.UserId == userId)
            .OrderBy(goal => goal.Name)
            .Take(100)
            .ToArrayAsync(cancellationToken);

        return userGoals.Select(GoalDto.FromGoal).ToArray();
    }
}
