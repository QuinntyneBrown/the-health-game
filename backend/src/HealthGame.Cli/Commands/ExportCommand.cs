using System.CommandLine;

namespace HealthGame.Cli.Commands;

public sealed class ExportCommand(ExportUsersCommand usersCommand)
{
    public Command Create()
    {
        var command = new Command("export", "Export HealthGame data to CSV files.");
        command.Subcommands.Add(usersCommand.Create());
        return command;
    }
}
