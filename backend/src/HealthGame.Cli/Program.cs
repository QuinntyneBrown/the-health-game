using HealthGame.Cli.Commands;
using HealthGame.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.CommandLine;

var builder = Host.CreateApplicationBuilder(args);

builder.Configuration.AddEnvironmentVariables("HEALTHGAME_");
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddTransient<ResetDatabaseCommand>();
builder.Services.AddTransient<ExportCommand>();
builder.Services.AddTransient<ExportUsersCommand>();
builder.Services.AddTransient<ImportCommand>();
builder.Services.AddTransient<ImportUsersCommand>();

using var host = builder.Build();

var rootCommand = new RootCommand("HealthGame command line tools.");
rootCommand.Subcommands.Add(host.Services.GetRequiredService<ResetDatabaseCommand>().Create());
rootCommand.Subcommands.Add(host.Services.GetRequiredService<ExportCommand>().Create());
rootCommand.Subcommands.Add(host.Services.GetRequiredService<ImportCommand>().Create());

return rootCommand.Parse(args).Invoke();
