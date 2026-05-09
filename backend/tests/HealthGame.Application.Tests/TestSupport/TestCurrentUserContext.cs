using HealthGame.Application.Abstractions.Identity;

namespace HealthGame.Application.Tests.TestSupport;

internal sealed class TestCurrentUserContext(string userId) : ICurrentUserContext
{
    public bool IsAuthenticated => !string.IsNullOrWhiteSpace(UserId);

    public string? UserId { get; set; } = userId;

    public string? Email { get; set; }

    public string? DisplayName { get; set; }

    public IReadOnlyCollection<string> Roles { get; set; } = Array.Empty<string>();
}
