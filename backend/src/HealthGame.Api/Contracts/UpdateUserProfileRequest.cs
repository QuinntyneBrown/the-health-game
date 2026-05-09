using HealthGame.Application.Users.Commands;

namespace HealthGame.Api.Contracts;

public sealed record UpdateUserProfileRequest(
    string DisplayName,
    string Email,
    string TimeZoneId)
{
    public UpdateCurrentUserProfileCommand ToCommand()
    {
        return new UpdateCurrentUserProfileCommand(DisplayName, Email, TimeZoneId);
    }

    public BootstrapCurrentUserProfileCommand ToBootstrapCommand()
    {
        return new BootstrapCurrentUserProfileCommand(DisplayName, Email, TimeZoneId);
    }
}
