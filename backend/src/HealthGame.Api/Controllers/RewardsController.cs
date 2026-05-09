using HealthGame.Api.Contracts;
using HealthGame.Api.Security;
using HealthGame.Application.Rewards;
using HealthGame.Application.Rewards.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthGame.Api.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.User)]
public sealed class RewardsController(IMediator mediator) : ControllerBase
{
    [HttpGet("api/rewards")]
    [ProducesResponseType<IReadOnlyCollection<RewardDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyCollection<RewardDto>>> GetRewards(CancellationToken cancellationToken)
    {
        var rewards = await mediator.Send(new GetRewardsQuery(), cancellationToken);

        return Ok(rewards);
    }

    [HttpGet("api/goals/{goalId:guid}/rewards")]
    [ProducesResponseType<IReadOnlyCollection<RewardDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyCollection<RewardDto>>> GetGoalRewards(
        Guid goalId,
        CancellationToken cancellationToken)
    {
        var rewards = await mediator.Send(new GetGoalRewardsQuery(goalId), cancellationToken);

        return rewards is null ? NotFound() : Ok(rewards);
    }

    [HttpPost("api/goals/{goalId:guid}/rewards")]
    [ProducesResponseType<RewardDto>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RewardDto>> CreateReward(
        Guid goalId,
        CreateRewardRequest request,
        CancellationToken cancellationToken)
    {
        var reward = await mediator.Send(request.ToCommand(goalId), cancellationToken);

        if (reward is null)
        {
            return NotFound();
        }

        return CreatedAtAction(nameof(GetGoalRewards), new { goalId }, reward);
    }
}
