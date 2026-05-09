using MediatR;

namespace HealthGame.Application.Users.Commands;

public sealed record UpdateCurrentUserProfileCommand(
    string DisplayName,
    string Email,
    string TimeZoneId) : IRequest<UserProfileDto?>;
