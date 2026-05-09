using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Abstractions.Persistence;
using HealthGame.Application.Common;
using HealthGame.Application.Users.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HealthGame.Application.Users.QueryHandlers;

public sealed class GetCurrentUserProfileQueryHandler(
    ICurrentUserContext currentUser,
    IHealthGameContext context) : IRequestHandler<GetCurrentUserProfileQuery, UserProfileDto?>
{
    public async Task<UserProfileDto?> Handle(GetCurrentUserProfileQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUser.RequireUserId();

        var profile = await context.UserProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(
                profile => profile.SubjectId == userId && profile.DeletedAtUtc == null,
                cancellationToken);

        return profile is null ? null : UserProfileDto.FromUserProfile(profile);
    }
}
