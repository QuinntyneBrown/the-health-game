using FluentValidation;

namespace HealthGame.Application.Rewards;

public sealed class RewardConditionDtoValidator : AbstractValidator<RewardConditionDto>
{
    public RewardConditionDtoValidator()
    {
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.RequiredStreakCount).GreaterThanOrEqualTo(1);
    }
}
