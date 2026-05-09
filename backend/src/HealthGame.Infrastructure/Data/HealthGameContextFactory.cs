using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace HealthGame.Infrastructure.Data;

public sealed class HealthGameContextFactory : IDesignTimeDbContextFactory<HealthGameContext>
{
    private const string DefaultLocalConnectionString =
        "Server=(localdb)\\MSSQLLocalDB;Database=HealthGame;Trusted_Connection=True;TrustServerCertificate=True";

    public HealthGameContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("HEALTHGAME_CONNECTIONSTRING")
            ?? DefaultLocalConnectionString;

        var options = new DbContextOptionsBuilder<HealthGameContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new HealthGameContext(options);
    }
}
