namespace OrionTemplate.Blazor.Services;

public sealed class OrionTemplateClient(HttpClient httpClient, ILogger<OrionTemplateClient> logger)
{
    public async Task<List<OrionTemplateViewModel>> GetAsync(string filtro)
    {
        logger.LogInformation("Consultando dados Blazor com filtro {Filtro}", filtro);
        await Task.CompletedTask;

        return
        [
            new OrionTemplateViewModel("1", DateOnly.FromDateTime(DateTime.UtcNow), 0m, string.IsNullOrWhiteSpace(filtro) ? "Template" : filtro)
        ];
    }
}
