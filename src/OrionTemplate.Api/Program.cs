using OrionTemplate.Api.Repositories;
using OrionTemplate.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddLogging();
builder.Services.AddScoped<IOrionTemplateRepository, OrionTemplateRepository>();
builder.Services.AddScoped<IOrionTemplateService, OrionTemplateService>();

var app = builder.Build();

app.MapGet("/orion-template/{id}", async (string id, IOrionTemplateService service, ILoggerFactory loggerFactory) =>
{
    var logger = loggerFactory.CreateLogger("ORION.OrionTemplate");
    try
    {
        var result = await service.GetAsync(id);
        return result is null ? Results.NotFound() : Results.Ok(result);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao consultar OrionTemplate por {Id}", id);
        return Results.Problem("Erro interno ao consultar recurso.");
    }
});

app.Run();
