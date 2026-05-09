using FluentValidation;

namespace HealthGame.Application.Activities.Commands;

public sealed class DeleteActivityEntryCommandValidator : AbstractValidator<DeleteActivityEntryCommand>
{
    public DeleteActivityEntryCommandValidator()
    {
        RuleFor(x => x.GoalId).NotEmpty();
        RuleFor(x => x.ActivityEntryId).NotEmpty();
    }
}
