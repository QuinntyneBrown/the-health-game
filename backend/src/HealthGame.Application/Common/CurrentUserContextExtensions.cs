using HealthGame.Application.Abstractions.Identity;

namespace HealthGame.Application.Common;

internal static class CurrentUserContextExtensions
{
    public static string RequireUserId(this ICurrentUserContext currentUser)
    {
        if (!currentUser.IsAuthenticated || string.IsNullOrWhiteSpace(currentUser.UserId))
        {
            throw new UnauthorizedAccessException("An authenticated user is required.");
        }

        return currentUser.UserId;
    }
}
