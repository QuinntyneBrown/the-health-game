namespace HealthGame.Application.Abstractions.Identity;

public interface ICurrentUserContext
{
    bool IsAuthenticated { get; }

    string? UserId { get; }

    IReadOnlyCollection<string> Roles { get; }
}
