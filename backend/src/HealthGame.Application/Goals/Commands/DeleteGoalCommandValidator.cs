using FluentValidation;

namespace HealthGame.Application.Goals.Commands;

public sealed class DeleteGoalCommandValidator : AbstractValidator<DeleteGoalCommand>
{
    public DeleteGoalCommandValidator()
    {
        RuleFor(x => x.GoalId).NotEmpty();
    }
}
