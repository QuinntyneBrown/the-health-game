using HealthGame.Api.Contracts;
using HealthGame.Api.Security;
using HealthGame.Application.Activities;
using HealthGame.Application.Activities.Commands;
using HealthGame.Application.Activities.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthGame.Api.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.User)]
[Route("api/goals/{goalId:guid}/activities")]
public sealed class ActivitiesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyCollection<ActivityEntryDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyCollection<ActivityEntryDto>>> GetActivities(
        Guid goalId,
        CancellationToken cancellationToken)
    {
        var entries = await mediator.Send(new GetGoalActivityEntriesQuery(goalId), cancellationToken);

        return entries is null ? NotFound() : Ok(entries);
    }

    [HttpPost]
    [ProducesResponseType<ActivityEntryDto>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ActivityEntryDto>> LogActivity(
        Guid goalId,
        LogActivityRequest request,
        CancellationToken cancellationToken)
    {
        var entry = await mediator.Send(request.ToCommand(goalId), cancellationToken);

        if (entry is null)
        {
            return NotFound();
        }

        return CreatedAtAction(
            nameof(GetActivities),
            new { goalId },
            entry);
    }

    [HttpPut("{activityEntryId:guid}")]
    [ProducesResponseType<ActivityEntryDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ActivityEntryDto>> UpdateActivity(
        Guid goalId,
        Guid activityEntryId,
        UpdateActivityEntryRequest request,
        CancellationToken cancellationToken)
    {
        var entry = await mediator.Send(request.ToCommand(goalId, activityEntryId), cancellationToken);

        return entry is null ? NotFound() : Ok(entry);
    }

    [HttpDelete("{activityEntryId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteActivity(
        Guid goalId,
        Guid activityEntryId,
        CancellationToken cancellationToken)
    {
        var deleted = await mediator.Send(new DeleteActivityEntryCommand(goalId, activityEntryId), cancellationToken);

        return deleted ? NoContent() : NotFound();
    }
}
