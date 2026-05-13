using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace HealthGame.Api.Security;

public sealed class E2ETestAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "E2ETest";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authorization = Request.Headers.Authorization.ToString();

        if (!authorization.StartsWith("Bearer e2e-", StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var token = authorization["Bearer ".Length..].Trim();
        var tokenUserId = token.Length > "e2e-".Length ? token["e2e-".Length..] : "e2e-user";
        var userId = Request.Headers["X-E2E-User"].FirstOrDefault() ?? tokenUserId;
        var email = Request.Headers["X-E2E-Email"].FirstOrDefault() ?? $"{userId}@example.test";
        var displayName = Request.Headers["X-E2E-Name"].FirstOrDefault() ?? "E2E User";
        var roles = Request.Headers["X-E2E-Roles"].FirstOrDefault() ?? "User";

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new("sub", userId),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Name, displayName),
        };

        claims.AddRange(
            roles
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(role => new Claim(ClaimTypes.Role, role)));

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
