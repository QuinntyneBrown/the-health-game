using FluentValidation;

namespace HealthGame.Application.Rewards.Commands;

public sealed class CreateRewardCommandValidator : AbstractValidator<CreateRewardCommand>
{
    public CreateRewardCommandValidator()
    {
        RuleFor(x => x.GoalId)
            .NotEmpty();

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(x => x.Description)
            .MaximumLength(500);

        RuleFor(x => x.Condition)
            .NotNull()
            .SetValidator(new RewardConditionDtoValidator());
    }
}
