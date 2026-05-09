using FluentValidation;

namespace HealthGame.Application.Users.Commands;

public sealed class UpdateCurrentUserProfileCommandValidator : AbstractValidator<UpdateCurrentUserProfileCommand>
{
    public UpdateCurrentUserProfileCommandValidator()
    {
        RuleFor(x => x.DisplayName)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(254);

        RuleFor(x => x.TimeZoneId)
            .NotEmpty()
            .MaximumLength(128);
    }
}
