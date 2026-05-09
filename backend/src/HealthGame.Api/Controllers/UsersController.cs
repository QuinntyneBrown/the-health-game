using HealthGame.Api.Contracts;
using HealthGame.Api.Security;
using HealthGame.Application.Abstractions.Identity;
using HealthGame.Application.Users;
using HealthGame.Application.Users.Commands;
using HealthGame.Application.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthGame.Api.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.User)]
[Route("api/users")]
public sealed class UsersController(
    IMediator mediator,
    ICurrentUserContext currentUser) : ControllerBase
{
    [HttpGet("me")]
    [ProducesResponseType<UserProfileDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProfileDto>> GetMe(CancellationToken cancellationToken)
    {
        var profile = await mediator.Send(new GetCurrentUserProfileQuery(), cancellationToken);

        if (profile is not null)
        {
            return Ok(profile);
        }

        var displayName = currentUser.DisplayName ?? currentUser.Email ?? currentUser.UserId ?? "User";
        var email = currentUser.Email ?? $"{currentUser.UserId}@unknown.local";
        var bootstrap = await mediator.Send(
            new BootstrapCurrentUserProfileCommand(displayName, email, "UTC"),
            cancellationToken);

        return Ok(bootstrap);
    }

    [HttpPut("me")]
    [ProducesResponseType<UserProfileDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileDto>> UpdateMe(
        UpdateUserProfileRequest request,
        CancellationToken cancellationToken)
    {
        var existing = await mediator.Send(new GetCurrentUserProfileQuery(), cancellationToken);

        if (existing is null)
        {
            var bootstrap = await mediator.Send(request.ToBootstrapCommand(), cancellationToken);
            return Ok(bootstrap);
        }

        var profile = await mediator.Send(request.ToCommand(), cancellationToken);

        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpDelete("me")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMe(CancellationToken cancellationToken)
    {
        var deleted = await mediator.Send(new DeleteCurrentUserAccountCommand(), cancellationToken);

        return deleted ? NoContent() : NotFound();
    }
}
