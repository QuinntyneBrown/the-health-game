using HealthGame.Cli.Services;
using HealthGame.Domain.Users;
using HealthGame.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.CommandLine;

namespace HealthGame.Cli.Commands;

public sealed class ResetDatabaseCommand(IServiceScopeFactory scopeFactory)
{
    public Command Create()
    {
        var usernameOption = new Option<string>("--username")
        {
            Description = "Seeded local username.",
            DefaultValueFactory = _ => "quinn"
        };
        var passwordOption = new Option<string>("--password")
        {
            Description = "Seeded local password.",
            DefaultValueFactory = _ => "Password1!"
        };
        var emailOption = new Option<string>("--email")
        {
            Description = "Seeded local user email.",
            DefaultValueFactory = _ => "quinn@example.test"
        };

        var command = new Command("reset-database", "Drop, recreate, migrate, and seed the HealthGame database.");
        command.Options.Add(usernameOption);
        command.Options.Add(passwordOption);
        command.Options.Add(emailOption);
        command.SetAction(async (parseResult, cancellationToken) =>
        {
            var username = parseResult.GetRequiredValue(usernameOption);
            var password = parseResult.GetRequiredValue(passwordOption);
            var email = parseResult.GetRequiredValue(emailOption);

            await using var scope = scopeFactory.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<HealthGameContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ResetDatabaseCommand>>();

            logger.LogWarning("Resetting HealthGame database.");
            await context.Database.EnsureDeletedAsync(cancellationToken);
            await context.Database.MigrateAsync(cancellationToken);

            var now = DateTimeOffset.UtcNow;
            var user = UserProfile.CreateLocal(
                subjectId: username,
                username: username,
                displayName: "Quinn",
                email: email,
                passwordHash: PasswordHashing.Hash(password),
                timeZoneId: "UTC",
                createdAtUtc: now);

            context.UserProfiles.Add(user);
            await context.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Seeded local user {Username}.", username);
        });

        return command;
    }
}
