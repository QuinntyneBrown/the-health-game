using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace HealthGame.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            if (context.Response.HasStarted)
            {
                throw;
            }

            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var userId =
            context.User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            context.User.FindFirstValue("sub");

        logger.LogError(
            exception,
            "Unhandled exception for {Method} {Path} and user {UserId}.",
            context.Request.Method,
            context.Request.Path.Value,
            userId);

        if (exception is ValidationException validationException)
        {
            await WriteValidationProblemAsync(context, validationException);
            return;
        }

        var statusCode = exception switch
        {
            ArgumentException => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError
        };

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = GetTitle(statusCode),
            Detail = statusCode == StatusCodes.Status500InternalServerError
                ? "An unexpected error occurred."
                : exception.Message,
            Instance = context.TraceIdentifier
        };

        AttachCorrelationId(context, problem);

        await context.Response.WriteAsJsonAsync(problem);
    }

    private static async Task WriteValidationProblemAsync(
        HttpContext context,
        ValidationException validationException)
    {
        var errors = validationException.Errors
            .GroupBy(failure => failure.PropertyName)
            .ToDictionary(
                group => group.Key,
                group => group.Select(failure => failure.ErrorMessage).ToArray());

        context.Response.Clear();
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        context.Response.ContentType = "application/problem+json";

        var problem = new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "One or more validation errors occurred.",
            Instance = context.TraceIdentifier
        };

        AttachCorrelationId(context, problem);

        await context.Response.WriteAsJsonAsync(problem);
    }

    private static void AttachCorrelationId(HttpContext context, ProblemDetails problem)
    {
        if (context.Items.TryGetValue(CorrelationIdMiddleware.HeaderName, out var correlationId))
        {
            problem.Extensions["correlationId"] = correlationId;
        }
    }

    private static string GetTitle(int statusCode)
    {
        return statusCode switch
        {
            StatusCodes.Status400BadRequest => "Invalid request.",
            StatusCodes.Status401Unauthorized => "Authentication is required.",
            _ => "Request failed."
        };
    }
}
