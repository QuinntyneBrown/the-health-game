using HealthGame.Cli.Services;
using HealthGame.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.CommandLine;

namespace HealthGame.Cli.Commands;

public sealed class ExportUsersCommand(IServiceScopeFactory scopeFactory)
{
    public Command Create()
    {
        var fileArgument = new Argument<FileInfo>("file")
        {
            Description = "Destination users CSV file."
        };

        var command = new Command("users", "Export users to a CSV file.");
        command.Arguments.Add(fileArgument);
        command.SetAction(async (parseResult, cancellationToken) =>
        {
            var file = parseResult.GetRequiredValue(fileArgument);
            await using var scope = scopeFactory.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<HealthGameContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ExportUsersCommand>>();

            if (file.Directory is not null)
            {
                file.Directory.Create();
            }

            var users = await context.UserProfiles
                .AsNoTracking()
                .OrderBy(profile => profile.Username ?? profile.SubjectId)
                .ToListAsync(cancellationToken);

            await using var stream = file.Open(FileMode.Create, FileAccess.Write, FileShare.None);
            await using var writer = new StreamWriter(stream);
            await writer.WriteLineAsync("subjectId,username,displayName,email,timeZoneId,roles,createdAtUtc,deletedAtUtc,disabledAtUtc");

            foreach (var user in users)
            {
                var row = Csv.Row(
                    user.SubjectId,
                    user.Username ?? string.Empty,
                    user.DisplayName,
                    user.Email,
                    user.TimeZoneId,
                    string.Join("|", user.Roles),
                    user.CreatedAtUtc.ToString("O"),
                    user.DeletedAtUtc?.ToString("O") ?? string.Empty,
                    user.DisabledAtUtc?.ToString("O") ?? string.Empty);
                await writer.WriteLineAsync(row);
            }

            logger.LogInformation("Exported {Count} users to {File}.", users.Count, file.FullName);
        });

        return command;
    }
}
