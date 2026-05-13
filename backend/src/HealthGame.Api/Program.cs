using HealthGame.Api.Middleware;
using HealthGame.Api.Security;
using HealthGame.Api.Services;
using HealthGame.Application;
using HealthGame.Application.Abstractions.Identity;
using HealthGame.Infrastructure;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "LocalFrontend",
        policy => policy
            .SetIsOriginAllowed(origin =>
            {
                if (!builder.Environment.IsDevelopment())
                {
                    return false;
                }

                return Uri.TryCreate(origin, UriKind.Absolute, out var uri)
                    && (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
                        || uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase));
            })
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserContext, HttpCurrentUserContext>();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var useE2ETestAuth = builder.Configuration.GetValue<bool>("E2E:UseTestAuth");

if (useE2ETestAuth)
{
    builder.Services
        .AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = E2ETestAuthHandler.SchemeName;
            options.DefaultChallengeScheme = E2ETestAuthHandler.SchemeName;
        })
        .AddScheme<AuthenticationSchemeOptions, E2ETestAuthHandler>(
            E2ETestAuthHandler.SchemeName,
            _ => { });
}
else
{
    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            var authority = builder.Configuration["Authentication:Authority"];
            var audience = builder.Configuration["Authentication:Audience"];

            if (!string.IsNullOrWhiteSpace(authority))
            {
                options.Authority = authority;
            }

            if (!string.IsNullOrWhiteSpace(audience))
            {
                options.Audience = audience;
            }

            options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        });
}

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthorizationPolicies.User, policy =>
        policy.RequireAuthenticatedUser());

    options.AddPolicy(AuthorizationPolicies.Admin, policy =>
        policy.RequireAuthenticatedUser().RequireRole(AuthorizationPolicies.Admin));
});

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors("LocalFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
