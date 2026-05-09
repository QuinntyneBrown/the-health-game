// Acceptance Test
// Traces to: L2-001, L2-003, L2-004, L2-015
// Description: Goal create/update/delete handlers enforce ownership and ignore deleted goals.

using HealthGame.Application.Goals;
using HealthGame.Application.Goals.Commands;
using HealthGame.Application.Goals.CommandHandlers;
using HealthGame.Application.Tests.TestSupport;
using HealthGame.Domain.Goals;
using Microsoft.Extensions.Logging.Abstractions;

namespace HealthGame.Application.Tests.Goals;

public sealed class GoalCommandHandlerTests
{
    [Fact]
    public async Task Create_persists_goal_for_current_user()
    {
        await using var context = TestContextFactory.Create();
        var clock = new TestClock(new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero));
        var user = new TestCurrentUserContext("user-1");

        var handler = new CreateGoalCommandHandler(user, context, clock, NullLogger<CreateGoalCommandHandler>.Instance);

        var dto = await handler.Handle(
            new CreateGoalCommand("Walk", null, 1m, "session", new GoalCadenceDto(GoalCadenceType.Daily, 1)),
            CancellationToken.None);

        Assert.Single(context.Goals);
        Assert.Equal("Walk", dto.Name);
    }

    [Fact]
    public async Task Update_returns_null_for_non_owned_goal()
    {
        await using var context = TestContextFactory.Create();
        var clock = new TestClock(DateTimeOffset.UtcNow);

        var ownerGoal = Goal.Create(
            "user-other", "Read", null, 1m, "page",
            GoalCadence.Create(GoalCadenceType.Daily),
            clock.UtcNow);
        context.Goals.Add(ownerGoal);
        await context.SaveChangesAsync();

        var user = new TestCurrentUserContext("user-1");
        var handler = new UpdateGoalCommandHandler(user, context, clock, NullLogger<UpdateGoalCommandHandler>.Instance);

        var result = await handler.Handle(
            new UpdateGoalCommand(
                ownerGoal.Id,
                "Hijack",
                null,
                1m,
                "session",
                new GoalCadenceDto(GoalCadenceType.Daily, 1),
                null,
                null),
            CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Delete_marks_owned_goal_as_deleted()
    {
        await using var context = TestContextFactory.Create();
        var clock = new TestClock(DateTimeOffset.UtcNow);

        var goal = Goal.Create(
            "user-1", "Walk", null, 1m, "session",
            GoalCadence.Create(GoalCadenceType.Daily),
            clock.UtcNow);
        context.Goals.Add(goal);
        await context.SaveChangesAsync();

        var user = new TestCurrentUserContext("user-1");
        var handler = new DeleteGoalCommandHandler(user, context, clock, NullLogger<DeleteGoalCommandHandler>.Instance);

        var deleted = await handler.Handle(new DeleteGoalCommand(goal.Id), CancellationToken.None);

        Assert.True(deleted);
        var refreshed = context.Goals.Single();
        Assert.True(refreshed.IsDeleted);
    }
}
