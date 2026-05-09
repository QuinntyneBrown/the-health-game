using FluentValidation;

namespace HealthGame.Application.Goals.Commands;

public sealed class CreateGoalCommandValidator : AbstractValidator<CreateGoalCommand>
{
    public CreateGoalCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(x => x.Description)
            .MaximumLength(500);

        RuleFor(x => x.TargetQuantity)
            .InclusiveBetween(0.0001m, 1_000_000_000m);

        RuleFor(x => x.TargetUnit)
            .NotEmpty()
            .MaximumLength(32);

        RuleFor(x => x.Cadence)
            .NotNull()
            .SetValidator(new GoalCadenceDtoValidator());

        RuleFor(x => x.TimeZoneId)
            .MaximumLength(128);
    }
}
