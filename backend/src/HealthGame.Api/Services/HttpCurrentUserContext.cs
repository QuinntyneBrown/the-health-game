using System.Security.Claims;
using HealthGame.Application.Abstractions.Identity;

namespace HealthGame.Api.Services;

public sealed class HttpCurrentUserContext(IHttpContextAccessor httpContextAccessor) : ICurrentUserContext
{
    public bool IsAuthenticated =>
        httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated == true;

    public string? UserId =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) ??
        httpContextAccessor.HttpContext?.User.FindFirstValue("sub");

    public IReadOnlyCollection<string> Roles
    {
        get
        {
            var user = httpContextAccessor.HttpContext?.User;

            if (user is null)
            {
                return Array.Empty<string>();
            }

            return user.FindAll(ClaimTypes.Role)
                .Concat(user.FindAll("role"))
                .Concat(user.FindAll("roles"))
                .Select(claim => claim.Value)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();
        }
    }
}
