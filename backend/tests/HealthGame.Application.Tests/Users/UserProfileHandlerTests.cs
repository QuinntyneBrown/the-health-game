// Acceptance Test
// Traces to: L2-013, L2-014, L2-015
// Description: User profile bootstrap creates a profile when missing and reuses an existing active profile.

using HealthGame.Application.Tests.TestSupport;
using HealthGame.Application.Users.CommandHandlers;
using HealthGame.Application.Users.Commands;
using HealthGame.Domain.Users;
using Microsoft.Extensions.Logging.Abstractions;

namespace HealthGame.Application.Tests.Users;

public sealed class UserProfileHandlerTests
{
    [Fact]
    public async Task Bootstrap_creates_profile_for_new_subject()
    {
        await using var context = TestContextFactory.Create();
        var clock = new TestClock(DateTimeOffset.UtcNow);
        var user = new TestCurrentUserContext("subject-1");

        var handler = new BootstrapCurrentUserProfileCommandHandler(
            user, context, clock,
            NullLogger<BootstrapCurrentUserProfileCommandHandler>.Instance);

        var dto = await handler.Handle(
            new BootstrapCurrentUserProfileCommand("Alice", "alice@example.com", "UTC"),
            CancellationToken.None);

        Assert.Equal("Alice", dto.DisplayName);
        Assert.Single(context.UserProfiles);
    }

    [Fact]
    public async Task Bootstrap_returns_existing_active_profile()
    {
        await using var context = TestContextFactory.Create();
        var clock = new TestClock(DateTimeOffset.UtcNow);

        var existing = UserProfile.Create("subject-1", "Alice", "alice@example.com", "UTC", clock.UtcNow);
        context.UserProfiles.Add(existing);
        await context.SaveChangesAsync();

        var user = new TestCurrentUserContext("subject-1");
        var handler = new BootstrapCurrentUserProfileCommandHandler(
            user, context, clock,
            NullLogger<BootstrapCurrentUserProfileCommandHandler>.Instance);

        var dto = await handler.Handle(
            new BootstrapCurrentUserProfileCommand("Bob", "bob@example.com", "UTC"),
            CancellationToken.None);

        Assert.Equal(existing.Id, dto.Id);
        Assert.Equal("Alice", dto.DisplayName);
        Assert.Single(context.UserProfiles);
    }

    [Fact]
    public async Task Bootstrap_throws_when_profile_was_deleted()
    {
        await using var context = TestContextFactory.Create();
        var clock = new TestClock(DateTimeOffset.UtcNow);

        var existing = UserProfile.Create("subject-1", "Alice", "alice@example.com", "UTC", clock.UtcNow);
        existing.Delete(clock.UtcNow);
        context.UserProfiles.Add(existing);
        await context.SaveChangesAsync();

        var user = new TestCurrentUserContext("subject-1");
        var handler = new BootstrapCurrentUserProfileCommandHandler(
            user, context, clock,
            NullLogger<BootstrapCurrentUserProfileCommandHandler>.Instance);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(
            new BootstrapCurrentUserProfileCommand("Bob", "bob@example.com", "UTC"),
            CancellationToken.None));
    }
}
