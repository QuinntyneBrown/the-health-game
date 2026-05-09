using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Abstractions.Time;
using HealthGame.Application.Common;
using HealthGame.Application.Users.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HealthGame.Application.Users.CommandHandlers;

public sealed class UpdateCurrentUserProfileCommandHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context,
    IClock clock,
    ILogger<UpdateCurrentUserProfileCommandHandler> logger)
    : IRequestHandler<UpdateCurrentUserProfileCommand, UserProfileDto?>
{
    public async Task<UserProfileDto?> Handle(UpdateCurrentUserProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var profile = await context.UserProfiles
            .FirstOrDefaultAsync(
                profile => profile.SubjectId == userId && profile.DeletedAtUtc == null,
                cancellationToken);

        if (profile is null)
        {
            return null;
        }

        profile.UpdateProfile(request.DisplayName, request.Email, request.TimeZoneId, clock.UtcNow);

        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Updated user profile {ProfileId}.", profile.Id);

        return UserProfileDto.FromUserProfile(profile);
    }
}
