using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Common;
using HealthGame.Application.Goals.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HealthGame.Application.Goals.QueryHandlers;

public sealed class GetGoalByIdQueryHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context) : IRequestHandler<GetGoalByIdQuery, GoalDto?>
{
    public async Task<GoalDto?> Handle(GetGoalByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();
        var goal = await context.Goals
            .AsNoTracking()
            .FirstOrDefaultAsync(goal => goal.Id == request.GoalId && goal.UserId == userId, cancellationToken);

        return goal is null ? null : GoalDto.FromGoal(goal);
    }
}
