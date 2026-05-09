using System.ComponentModel.DataAnnotations;
using HealthGame.Application.Users.Commands;

namespace HealthGame.Api.Contracts;

public sealed record UpdateUserProfileRequest(
    [property: Required]
    [property: StringLength(120)]
    string DisplayName,

    [property: Required]
    [property: EmailAddress]
    [property: StringLength(254)]
    string Email,

    [property: Required]
    [property: StringLength(128)]
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
