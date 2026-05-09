namespace HealthGame.Domain.Goals;

public sealed record CadencePeriod
{
    public CadencePeriod(DateTimeOffset startsAtUtc, DateTimeOffset endsAtUtc)
    {
        var utcStart = startsAtUtc.ToUniversalTime();
        var utcEnd = endsAtUtc.ToUniversalTime();

        if (utcEnd <= utcStart)
        {
            throw new ArgumentException("Cadence period end must be after its start.", nameof(endsAtUtc));
        }

        StartsAtUtc = utcStart;
        EndsAtUtc = utcEnd;
    }

    public DateTimeOffset StartsAtUtc { get; }

    public DateTimeOffset EndsAtUtc { get; }

    public bool Contains(DateTimeOffset instantUtc)
    {
        var utc = instantUtc.ToUniversalTime();

        return utc >= StartsAtUtc && utc < EndsAtUtc;
    }

    public bool IsCompleteAt(DateTimeOffset instantUtc)
    {
        return instantUtc.ToUniversalTime() >= EndsAtUtc;
    }
}
