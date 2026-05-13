using HealthGame.Cli.Services;
using HealthGame.Domain.Users;
using HealthGame.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.CommandLine;

namespace HealthGame.Cli.Commands;

public sealed class ImportUsersCommand(IServiceScopeFactory scopeFactory)
{
    public Command Create()
    {
        var fileArgument = new Argument<FileInfo>("file")
        {
            Description = "Source users CSV file."
        };
        var defaultPasswordOption = new Option<string>("--default-password")
        {
            Description = "Password used for imported users that need a local credential.",
            DefaultValueFactory = _ => "Password1!"
        };

        var command = new Command("users", "Import users from a CSV file.");
        command.Arguments.Add(fileArgument);
        command.Options.Add(defaultPasswordOption);
        command.SetAction(async (parseResult, cancellationToken) =>
        {
            var file = parseResult.GetRequiredValue(fileArgument);
            var defaultPassword = parseResult.GetRequiredValue(defaultPasswordOption);

            if (!file.Exists)
            {
                throw new FileNotFoundException("Users CSV file was not found.", file.FullName);
            }

            await using var scope = scopeFactory.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<HealthGameContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ImportUsersCommand>>();

            var records = await Csv.ReadAsync(file, cancellationToken);
            var imported = 0;
            foreach (var record in records)
            {
                var subjectId = Value(record, "subjectId");
                var username = Value(record, "username", subjectId);
                var displayName = Value(record, "displayName", username);
                var email = Value(record, "email", $"{username}@example.test");
                var timeZoneId = Value(record, "timeZoneId", "UTC");

                var existing = await context.UserProfiles
                    .FirstOrDefaultAsync(profile => profile.SubjectId == subjectId, cancellationToken);

                if (existing is null)
                {
                    var user = UserProfile.CreateLocal(
                        subjectId,
                        username,
                        displayName,
                        email,
                        PasswordHashing.Hash(defaultPassword),
                        timeZoneId,
                        DateTimeOffset.UtcNow);

                    AddRoles(user, Value(record, "roles"), DateTimeOffset.UtcNow);
                    context.UserProfiles.Add(user);
                    imported++;
                    continue;
                }

                if (existing.IsDeleted)
                {
                    logger.LogWarning("Skipping deleted user profile {SubjectId}.", subjectId);
                    continue;
                }

                existing.UpdateProfile(displayName, email, timeZoneId, DateTimeOffset.UtcNow);
                existing.SetUsername(username, DateTimeOffset.UtcNow);
                if (string.IsNullOrWhiteSpace(existing.PasswordHash))
                {
                    existing.SetPasswordHash(PasswordHashing.Hash(defaultPassword), DateTimeOffset.UtcNow);
                }

                AddRoles(existing, Value(record, "roles"), DateTimeOffset.UtcNow);
                imported++;
            }

            await context.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Imported {Count} users from {File}.", imported, file.FullName);
        });

        return command;
    }

    private static string Value(IReadOnlyDictionary<string, string> record, string name, string? fallback = null)
    {
        return record.TryGetValue(name, out var value) && !string.IsNullOrWhiteSpace(value)
            ? value
            : fallback ?? throw new InvalidOperationException($"CSV column '{name}' is required.");
    }

    private static void AddRoles(UserProfile user, string roles, DateTimeOffset now)
    {
        foreach (var roleText in roles.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (Enum.TryParse<UserRole>(roleText, ignoreCase: true, out var role) && role != UserRole.User)
            {
                user.AddRole(role, now);
            }
        }
    }
}
