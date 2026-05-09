using HealthGame.Application.Abstractions.Time;

namespace HealthGame.Infrastructure.Time;

internal sealed class SystemClock : IClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
