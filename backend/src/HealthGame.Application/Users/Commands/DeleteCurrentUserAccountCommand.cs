using MediatR;

namespace HealthGame.Application.Users.Commands;

public sealed record DeleteCurrentUserAccountCommand : IRequest<bool>;
