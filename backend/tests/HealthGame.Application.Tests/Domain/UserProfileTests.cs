// Acceptance Test
// Traces to: L2-014, L2-015
// Description: UserProfile invariants — creation, role management, deletion.

using HealthGame.Domain.Users;

namespace HealthGame.Application.Tests.Domain;

public sealed class UserProfileTests
{
    [Fact]
    public void Create_assigns_default_user_role()
    {
        var profile = UserProfile.Create("subject-1", "Alice", "alice@example.com", "UTC", DateTimeOffset.UtcNow);

        Assert.Contains(UserRole.User, profile.Roles);
    }

    [Fact]
    public void AddRole_admin_appends_role()
    {
        var profile = UserProfile.Create("subject-1", "Alice", "alice@example.com", "UTC", DateTimeOffset.UtcNow);

        profile.AddRole(UserRole.Admin, DateTimeOffset.UtcNow);

        Assert.Contains(UserRole.Admin, profile.Roles);
    }

    [Fact]
    public void RemoveRole_user_throws()
    {
        var profile = UserProfile.Create("subject-1", "Alice", "alice@example.com", "UTC", DateTimeOffset.UtcNow);

        Assert.Throws<InvalidOperationException>(() => profile.RemoveRole(UserRole.User, DateTimeOffset.UtcNow));
    }

    [Fact]
    public void Create_with_invalid_email_throws()
    {
        Assert.Throws<ArgumentException>(() =>
            UserProfile.Create("subject-1", "Alice", "not-an-email", "UTC", DateTimeOffset.UtcNow));
    }

    [Fact]
    public void Update_after_delete_throws()
    {
        var profile = UserProfile.Create("subject-1", "Alice", "alice@example.com", "UTC", DateTimeOffset.UtcNow);

        profile.Delete(DateTimeOffset.UtcNow);

        Assert.Throws<InvalidOperationException>(() =>
            profile.UpdateProfile("Bob", "bob@example.com", "UTC", DateTimeOffset.UtcNow));
    }
}
