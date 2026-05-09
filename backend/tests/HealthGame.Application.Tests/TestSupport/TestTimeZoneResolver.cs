using HealthGame.Application.Abstractions.Time;

namespace HealthGame.Application.Tests.TestSupport;

internal sealed class TestTimeZoneResolver : ITimeZoneResolver
{
    public TimeZoneInfo Resolve(string? timeZoneId) => TimeZoneInfo.Utc;
}
