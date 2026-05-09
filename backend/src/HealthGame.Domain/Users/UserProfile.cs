using HealthGame.Domain.Common;

namespace HealthGame.Domain.Users;

public sealed class UserProfile
{
    private readonly List<UserRole> _roles = [];

    private UserProfile()
    {
    }

    public Guid Id { get; private set; }

    public string SubjectId { get; private set; } = string.Empty;

    public string DisplayName { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public string TimeZoneId { get; private set; } = "UTC";

    public IReadOnlyCollection<UserRole> Roles => _roles.AsReadOnly();

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public DateTimeOffset? DeletedAtUtc { get; private set; }

    public bool IsDeleted => DeletedAtUtc.HasValue;

    public static UserProfile Create(
        string subjectId,
        string displayName,
        string email,
        string timeZoneId,
        DateTimeOffset createdAtUtc)
    {
        var profile = new UserProfile
        {
            Id = Guid.NewGuid(),
            SubjectId = Guard.Required(subjectId, nameof(subjectId), 128),
            DisplayName = Guard.Required(displayName, nameof(displayName), 120),
            Email = ValidateEmail(email),
            TimeZoneId = Guard.Required(timeZoneId, nameof(timeZoneId), 128),
            CreatedAtUtc = createdAtUtc.ToUniversalTime()
        };

        profile._roles.Add(UserRole.User);

        return profile;
    }

    public void UpdateProfile(
        string displayName,
        string email,
        string timeZoneId,
        DateTimeOffset updatedAtUtc)
    {
        EnsureActive();

        DisplayName = Guard.Required(displayName, nameof(displayName), 120);
        Email = ValidateEmail(email);
        TimeZoneId = Guard.Required(timeZoneId, nameof(timeZoneId), 128);
        UpdatedAtUtc = updatedAtUtc.ToUniversalTime();
    }

    public bool HasRole(UserRole role)
    {
        return _roles.Contains(role);
    }

    public void AddRole(UserRole role, DateTimeOffset updatedAtUtc)
    {
        EnsureActive();
        EnsureDefinedRole(role);

        if (_roles.Contains(role))
        {
            return;
        }

        _roles.Add(role);
        UpdatedAtUtc = updatedAtUtc.ToUniversalTime();
    }

    public void RemoveRole(UserRole role, DateTimeOffset updatedAtUtc)
    {
        EnsureActive();
        EnsureDefinedRole(role);

        if (role == UserRole.User)
        {
            throw new InvalidOperationException("The base user role cannot be removed.");
        }

        _roles.Remove(role);
        UpdatedAtUtc = updatedAtUtc.ToUniversalTime();
    }

    public void Delete(DateTimeOffset deletedAtUtc)
    {
        if (IsDeleted)
        {
            return;
        }

        DeletedAtUtc = deletedAtUtc.ToUniversalTime();
    }

    private static string ValidateEmail(string email)
    {
        var trimmed = Guard.Required(email, nameof(email), 254);

        if (!trimmed.Contains('@', StringComparison.Ordinal) || trimmed.StartsWith("@", StringComparison.Ordinal) || trimmed.EndsWith("@", StringComparison.Ordinal))
        {
            throw new ArgumentException("Email address is not valid.", nameof(email));
        }

        return trimmed;
    }

    private static void EnsureDefinedRole(UserRole role)
    {
        if (!Enum.IsDefined(role))
        {
            throw new ArgumentOutOfRangeException(nameof(role), "User role is not supported.");
        }
    }

    private void EnsureActive()
    {
        if (IsDeleted)
        {
            throw new InvalidOperationException("Deleted user profiles cannot be modified.");
        }
    }
}
