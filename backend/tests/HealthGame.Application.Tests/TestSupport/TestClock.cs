using HealthGame.Application.Abstractions.Time;

namespace HealthGame.Application.Tests.TestSupport;

internal sealed class TestClock(DateTimeOffset utcNow) : IClock
{
    public DateTimeOffset UtcNow { get; set; } = utcNow;
}
