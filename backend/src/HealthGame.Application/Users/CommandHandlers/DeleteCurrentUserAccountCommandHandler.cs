using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Abstractions.Time;
using HealthGame.Application.Common;
using HealthGame.Application.Users.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HealthGame.Application.Users.CommandHandlers;

public sealed class DeleteCurrentUserAccountCommandHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context,
    IClock clock,
    ILogger<DeleteCurrentUserAccountCommandHandler> logger)
    : IRequestHandler<DeleteCurrentUserAccountCommand, bool>
{
    public async Task<bool> Handle(DeleteCurrentUserAccountCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();
        var now = clock.UtcNow;

        var profile = await context.UserProfiles
            .FirstOrDefaultAsync(
                profile => profile.SubjectId == userId && profile.DeletedAtUtc == null,
                cancellationToken);

        if (profile is null)
        {
            return false;
        }

        profile.Delete(now);

        var goals = await context.Goals
            .Where(goal => goal.UserId == userId && goal.DeletedAtUtc == null)
            .ToArrayAsync(cancellationToken);

        foreach (var goal in goals)
        {
            goal.Delete(now);
        }

        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Deleted account {ProfileId} and {GoalCount} owned goals.", profile.Id, goals.Length);

        return true;
    }
}
