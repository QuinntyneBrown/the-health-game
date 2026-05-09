using HealthGame.Domain.Users;

namespace HealthGame.Application.Users;

public sealed record UserProfileDto(
    Guid Id,
    string SubjectId,
    string DisplayName,
    string Email,
    string TimeZoneId,
    IReadOnlyCollection<UserRole> Roles,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc)
{
    public static UserProfileDto FromUserProfile(UserProfile profile)
    {
        return new UserProfileDto(
            profile.Id,
            profile.SubjectId,
            profile.DisplayName,
            profile.Email,
            profile.TimeZoneId,
            profile.Roles.ToArray(),
            profile.CreatedAtUtc,
            profile.UpdatedAtUtc);
    }
}
