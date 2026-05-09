using MediatR;

namespace HealthGame.Application.Users.Commands;

public sealed record BootstrapCurrentUserProfileCommand(
    string DisplayName,
    string Email,
    string TimeZoneId) : IRequest<UserProfileDto>;
