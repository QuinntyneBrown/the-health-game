using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Abstractions.Time;
using HealthGame.Application.Common;
using HealthGame.Application.Users.Commands;
using HealthGame.Domain.Users;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HealthGame.Application.Users.CommandHandlers;

public sealed class BootstrapCurrentUserProfileCommandHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context,
    IClock clock,
    ILogger<BootstrapCurrentUserProfileCommandHandler> logger)
    : IRequestHandler<BootstrapCurrentUserProfileCommand, UserProfileDto>
{
    public async Task<UserProfileDto> Handle(BootstrapCurrentUserProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var existing = await context.UserProfiles
            .FirstOrDefaultAsync(profile => profile.SubjectId == userId, cancellationToken);

        if (existing is not null)
        {
            if (existing.IsDeleted)
            {
                throw new UnauthorizedAccessException("Account has been deleted.");
            }

            return UserProfileDto.FromUserProfile(existing);
        }

        var profile = UserProfile.Create(
            userId,
            request.DisplayName,
            request.Email,
            request.TimeZoneId,
            clock.UtcNow);

        await context.UserProfiles.AddAsync(profile, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Bootstrapped user profile {ProfileId} for subject {SubjectId}.", profile.Id, userId);

        return UserProfileDto.FromUserProfile(profile);
    }
}
