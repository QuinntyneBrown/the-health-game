using FluentValidation;

namespace HealthGame.Application.Goals;

public sealed class GoalCadenceDtoValidator : AbstractValidator<GoalCadenceDto>
{
    public GoalCadenceDtoValidator()
    {
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.Interval).GreaterThanOrEqualTo(1);
    }
}
