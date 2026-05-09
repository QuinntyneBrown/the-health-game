using FluentValidation;

namespace HealthGame.Application.Activities.Commands;

public sealed class UpdateActivityEntryCommandValidator : AbstractValidator<UpdateActivityEntryCommand>
{
    public UpdateActivityEntryCommandValidator()
    {
        RuleFor(x => x.GoalId)
            .NotEmpty();

        RuleFor(x => x.ActivityEntryId)
            .NotEmpty();

        RuleFor(x => x.Quantity)
            .InclusiveBetween(0.0001m, 1_000_000_000m);

        RuleFor(x => x.Notes)
            .MaximumLength(1000);
    }
}
