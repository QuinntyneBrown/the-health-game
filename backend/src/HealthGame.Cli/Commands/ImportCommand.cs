using System.CommandLine;

namespace HealthGame.Cli.Commands;

public sealed class ImportCommand(ImportUsersCommand usersCommand)
{
    public Command Create()
    {
        var command = new Command("import", "Import HealthGame data from CSV files.");
        command.Subcommands.Add(usersCommand.Create());
        return command;
    }
}
