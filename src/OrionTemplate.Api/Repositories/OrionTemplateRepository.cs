using OrionTemplate.Api.Models;

namespace OrionTemplate.Api.Repositories;

public interface IOrionTemplateRepository
{
    Task<OrionTemplateDto?> GetAsync(string id);
}

public sealed class OrionTemplateRepository(ILogger<OrionTemplateRepository> logger) : IOrionTemplateRepository
{
    public Task<OrionTemplateDto?> GetAsync(string id)
    {
        logger.LogInformation("Exemplo de query parametrizada para {Id}", id);
        const string sql = "SELECT id, reference_date, value, status FROM risco_table WHERE id = @id";
        _ = sql;

        OrionTemplateDto dto = new(id, DateOnly.FromDateTime(DateTime.UtcNow), 0m, "Template");
        return Task.FromResult<OrionTemplateDto?>(dto);
    }
}
