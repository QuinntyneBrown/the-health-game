// Acceptance Test
// Traces to: L2-005, L2-015
// Description: LogActivity handler returns 404-equivalent (null) for goals owned by another user.

using HealthGame.Application.Activities.Commands;
using HealthGame.Application.Activities.CommandHandlers;
using HealthGame.Application.Tests.TestSupport;
using HealthGame.Domain.Goals;
using Microsoft.Extensions.Logging.Abstractions;

namespace HealthGame.Application.Tests.Activities;

public sealed class LogActivityHandlerTests
{
    [Fact]
    public async Task Log_returns_null_for_non_owned_goal()
    {
        await using var context = TestContextFactory.Create();
        var clock = new TestClock(new DateTimeOffset(2026, 1, 1, 12, 0, 0, TimeSpan.Zero));

        var goal = Goal.Create(
            "user-other", "Walk", null, 1m, "session",
            GoalCadence.Create(GoalCadenceType.Daily),
            clock.UtcNow);
        context.Goals.Add(goal);
        await context.SaveChangesAsync();

        var user = new TestCurrentUserContext("user-1");
        var handler = new LogActivityCommandHandler(
            user, context, clock, new TestTimeZoneResolver(),
            NullLogger<LogActivityCommandHandler>.Instance);

        var result = await handler.Handle(
            new LogActivityCommand(goal.Id, clock.UtcNow.AddMinutes(-5), 1m, null),
            CancellationToken.None);

        Assert.Null(result);
    }
}
