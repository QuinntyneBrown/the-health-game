using HealthGame.Api.Contracts;
using HealthGame.Api.Security;
using HealthGame.Application.Goals;
using HealthGame.Application.Goals.Commands;
using HealthGame.Application.Goals.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthGame.Api.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.User)]
[Route("api/goals")]
public sealed class GoalsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyCollection<GoalDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyCollection<GoalDto>>> GetGoals(CancellationToken cancellationToken)
    {
        var goals = await mediator.Send(new GetGoalsQuery(), cancellationToken);

        return Ok(goals);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<GoalDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GoalDto>> GetGoal(Guid id, CancellationToken cancellationToken)
    {
        var goal = await mediator.Send(new GetGoalByIdQuery(id), cancellationToken);

        return goal is null ? NotFound() : Ok(goal);
    }

    [HttpPost]
    [ProducesResponseType<GoalDto>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<GoalDto>> CreateGoal(
        CreateGoalRequest request,
        CancellationToken cancellationToken)
    {
        var goal = await mediator.Send(request.ToCommand(), cancellationToken);

        return CreatedAtAction(nameof(GetGoal), new { id = goal.Id }, goal);
    }
}
