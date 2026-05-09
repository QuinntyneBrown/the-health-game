using HealthGame.Application.Abstractions.Time;
using HealthGame.Infrastructure.Data;
using HealthGame.Infrastructure.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HealthGame.Application.Abstractions.Persistence;

namespace HealthGame.Infrastructure;

public static class DependencyInjection
{
    private const string DefaultLocalConnectionString =
        "Server=(localdb)\\MSSQLLocalDB;Database=HealthGame;Trusted_Connection=True;TrustServerCertificate=True";

    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("HealthGame") ?? DefaultLocalConnectionString;

        services.AddDbContext<HealthGameContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IHealthGameContext>(serviceProvider =>
            serviceProvider.GetRequiredService<HealthGameContext>());
        services.AddSingleton<IClock, SystemClock>();
        services.AddSingleton<ITimeZoneResolver, SystemTimeZoneResolver>();

        return services;
    }
}
