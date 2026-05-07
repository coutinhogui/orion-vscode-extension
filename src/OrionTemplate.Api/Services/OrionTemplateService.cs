using OrionTemplate.Api.Models;
using OrionTemplate.Api.Repositories;

namespace OrionTemplate.Api.Services;

public interface IOrionTemplateService
{
    Task<OrionTemplateDto?> GetAsync(string id);
}

public sealed class OrionTemplateService(IOrionTemplateRepository repository, ILogger<OrionTemplateService> logger) : IOrionTemplateService
{
    public async Task<OrionTemplateDto?> GetAsync(string id)
    {
        logger.LogInformation("Consultando OrionTemplate para {Id}", id);
        return await repository.GetAsync(id);
    }
}
