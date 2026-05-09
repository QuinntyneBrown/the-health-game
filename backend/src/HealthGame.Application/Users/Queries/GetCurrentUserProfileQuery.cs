using MediatR;

namespace HealthGame.Application.Users.Queries;

public sealed record GetCurrentUserProfileQuery : IRequest<UserProfileDto?>;
