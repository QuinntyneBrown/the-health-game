using HealthGame.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HealthGame.Application.Tests.TestSupport;

internal static class TestContextFactory
{
    public static HealthGameContext Create()
    {
        return Create(Guid.NewGuid().ToString());
    }

    public static HealthGameContext Create(string databaseName)
    {
        var options = new DbContextOptionsBuilder<HealthGameContext>()
            .UseInMemoryDatabase($"healthgame-tests-{databaseName}")
            .Options;

        return new HealthGameContext(options);
    }
}
