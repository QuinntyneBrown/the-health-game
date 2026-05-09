using HealthGame.Domain.Common;

namespace HealthGame.Domain.Users;

public sealed class UserProfile
{
    private const int UsernameMaxLength = 64;
    private const int UsernameMinLength = 3;
    private const int PasswordHashMaxLength = 512;

    private readonly List<UserRole> _roles = [];

    private UserProfile()
    {
    }

    public Guid Id { get; private set; }

    public string SubjectId { get; private set; } = string.Empty;

    public string? Username { get; private set; }

    public string DisplayName { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public string TimeZoneId { get; private set; } = "UTC";

    public string? PasswordHash { get; private set; }

    public int FailedSignInCount { get; private set; }

    public DateTimeOffset? LockoutEndsAtUtc { get; private set; }

    public DateTimeOffset? LastSignInAtUtc { get; private set; }

    public IReadOnlyCollection<UserRole> Roles => _roles.AsReadOnly();

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public DateTimeOffset? DeletedAtUtc { get; private set; }

    public DateTimeOffset? DisabledAtUtc { get; private set; }

    public bool IsDeleted => DeletedAtUtc.HasValue;

    public bool IsDisabled => DisabledAtUtc.HasValue;

    public bool CanSignIn => !IsDeleted && !IsDisabled;

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

    public static UserProfile CreateLocal(
        string subjectId,
        string username,
        string displayName,
        string email,
        string passwordHash,
        string timeZoneId,
        DateTimeOffset createdAtUtc)
    {
        var profile = Create(subjectId, displayName, email, timeZoneId, createdAtUtc);
        profile.Username = ValidateUsername(username);
        profile.PasswordHash = ValidatePasswordHash(passwordHash);
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

    public void SetUsername(string username, DateTimeOffset updatedAtUtc)
    {
        EnsureActive();

        Username = ValidateUsername(username);
        UpdatedAtUtc = updatedAtUtc.ToUniversalTime();
    }

    public void SetPasswordHash(string passwordHash, DateTimeOffset updatedAtUtc)
    {
        EnsureActive();

        PasswordHash = ValidatePasswordHash(passwordHash);
        FailedSignInCount = 0;
        LockoutEndsAtUtc = null;
        UpdatedAtUtc = updatedAtUtc.ToUniversalTime();
    }

    public bool IsLockedOut(DateTimeOffset now)
    {
        return LockoutEndsAtUtc.HasValue && LockoutEndsAtUtc.Value > now.ToUniversalTime();
    }

    public void RegisterFailedSignIn(DateTimeOffset now, int failureThreshold, TimeSpan lockoutDuration)
    {
        if (failureThreshold <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(failureThreshold), "Failure threshold must be greater than zero.");
        }

        if (lockoutDuration <= TimeSpan.Zero)
        {
            throw new ArgumentOutOfRangeException(nameof(lockoutDuration), "Lockout duration must be greater than zero.");
        }

        var nowUtc = now.ToUniversalTime();
        FailedSignInCount += 1;

        if (FailedSignInCount >= failureThreshold)
        {
            LockoutEndsAtUtc = nowUtc + lockoutDuration;
            FailedSignInCount = 0;
        }
    }

    public void RegisterSuccessfulSignIn(DateTimeOffset now)
    {
        var nowUtc = now.ToUniversalTime();
        FailedSignInCount = 0;
        LockoutEndsAtUtc = null;
        LastSignInAtUtc = nowUtc;
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

    public void Disable(DateTimeOffset disabledAtUtc)
    {
        if (IsDisabled)
        {
            return;
        }

        DisabledAtUtc = disabledAtUtc.ToUniversalTime();
    }

    public void Enable(DateTimeOffset updatedAtUtc)
    {
        if (!IsDisabled)
        {
            return;
        }

        DisabledAtUtc = null;
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

    private static string ValidateUsername(string username)
    {
        var trimmed = Guard.Required(username, nameof(username), UsernameMaxLength);

        if (trimmed.Length < UsernameMinLength)
        {
            throw new ArgumentException($"Username must be at least {UsernameMinLength} characters.", nameof(username));
        }

        foreach (var ch in trimmed)
        {
            if (!(char.IsLetterOrDigit(ch) || ch is '_' or '-' or '.'))
            {
                throw new ArgumentException("Username may only contain letters, digits, '.', '_', or '-'.", nameof(username));
            }
        }

        return trimmed;
    }

    private static string ValidatePasswordHash(string passwordHash)
    {
        // Stored value is the opaque encoded output of a modern password hasher
        // (e.g., Argon2id, PBKDF2, bcrypt). Hashing and verification are caller concerns;
        // the domain only enforces presence and a length bound.
        return Guard.Required(passwordHash, nameof(passwordHash), PasswordHashMaxLength);
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
