import { normalizeName, toPascalCase } from './naming';
import { GeneratedFile } from './types';

export function buildCopilotInstructions(): string {
  return `# Instrucoes do GitHub Copilot - ORION

Voce atua em uma area de engenharia de dados de banco com foco em riscos financeiros.

## Principios
- Responder em portugues brasileiro.
- Priorizar seguranca, governanca, rastreabilidade e qualidade de dados.
- Nunca sugerir secrets hardcoded, endpoints produtivos ou acesso real a ambientes internos.
- Preferir solucoes locais, testaveis e documentadas.
- Para Databricks, considerar bronze/silver/gold, idempotencia, validacao de schema, duplicidade e contagens.
- Para .NET, Blazor, Python, Java e SQL, incluir logs, tratamento de erro e testes.

## Checklist minimo
- Sem secrets no codigo.
- Sem dados sensiveis em exemplos.
- Logs sem PII.
- Parametros por ambiente.
- Testes e validacoes descritos.
- Documentacao tecnica atualizada.
`;
}

export function buildEngineeringStandards(): string {
  return `# Padroes de Engenharia ORION

## Dados e Databricks
- Usar camadas bronze, silver e gold.
- Parametrizar data_base e reference_date.
- Registrar contagens antes/depois e validacoes de schema.
- Validar duplicidade e regras de qualidade antes da escrita final.
- Manter escrita idempotente.

## APIs e Aplicacoes
- Usar DTOs, services e repositories separados.
- Incluir logs estruturados e tratamento de erro.
- Usar consultas parametrizadas.
- Nao versionar secrets.

## Revisao
- Avaliar seguranca, performance, governanca, testes e operacao.
- Documentar decisoes relevantes em docs/.
`;
}

export function buildWorkspaceSetupFiles(defaultDataBase: string): GeneratedFile[] {
  return [
    { relativePath: '.github/copilot-instructions.md', content: buildCopilotInstructions() },
    {
      relativePath: '.vscode/settings.json',
      content: JSON.stringify({
        'files.eol': '\n',
        'editor.formatOnSave': true,
        'orion.workspace.defaultDataBase': defaultDataBase
      }, null, 2)
    },
    {
      relativePath: '.vscode/tasks.json',
      content: JSON.stringify({
        version: '2.0.0',
        tasks: [
          {
            label: 'ORION: validar workspace',
            type: 'shell',
            command: 'powershell',
            args: ['-ExecutionPolicy', 'Bypass', '-File', 'tools/orion.ps1'],
            problemMatcher: []
          }
        ]
      }, null, 2)
    },
    {
      relativePath: '.vscode/extensions.json',
      content: JSON.stringify({
        recommendations: [
          'github.copilot',
          'github.copilot-chat',
          'ms-python.python',
          'ms-dotnettools.csharp',
          'ms-toolsai.jupyter',
          'redhat.java'
        ]
      }, null, 2)
    },
    { relativePath: 'docs/engineering-standards.md', content: buildEngineeringStandards() },
    {
      relativePath: 'tools/orion.ps1',
      content: `Write-Host "ORION: validacao local do workspace"
Write-Host "- Verifique .github/copilot-instructions.md"
Write-Host "- Verifique docs/engineering-standards.md"
Write-Host "- Confirme ausencia de secrets e endpoints produtivos"
`
    }
  ];
}

export function buildDatabricksPipelineFiles(inputName: string, defaultDataBase: string): GeneratedFile[] {
  const name = normalizeName(inputName);
  const base = `pipelines/${name}`;
  const commonHeader = `# Databricks pipeline ORION - ${name}
# Execucao local/template. Nao contem secrets nem acesso real a producao.

import logging
from datetime import date

logger = logging.getLogger("orion.${name}")
data_base = dbutils.widgets.get("data_base") if "dbutils" in globals() else "${defaultDataBase}"
reference_date = dbutils.widgets.get("reference_date") if "dbutils" in globals() else str(date.today())

logger.info("Iniciando pipeline ${name}: data_base=%s reference_date=%s", data_base, reference_date)
`;

  return [
    {
      relativePath: `${base}/01_bronze_${name}.py`,
      content: `${commonHeader}
def validate_schema(df):
    required_columns = {"id", "reference_date"}
    missing = required_columns.difference(set(df.columns))
    if missing:
        raise ValueError(f"Colunas obrigatorias ausentes: {sorted(missing)}")

# TODO: substituir por leitura de fonte homologada e parametrizada.
source_path = f"/mnt/{data_base}/landing/${name}/reference_date={reference_date}"
logger.info("Fonte bronze parametrizada: %s", source_path)

# df = spark.read.format("parquet").load(source_path)
# validate_schema(df)
# before_count = df.count()
# df.write.mode("overwrite").format("delta").option("replaceWhere", f"reference_date = '{reference_date}'").saveAsTable(f"{data_base}.bronze_${name.replace('-', '_')}")
# logger.info("Bronze concluido com %s registros", before_count)
`
    },
    {
      relativePath: `${base}/02_silver_${name}.py`,
      content: `${commonHeader}
table_bronze = f"{data_base}.bronze_${name.replace('-', '_')}"
table_silver = f"{data_base}.silver_${name.replace('-', '_')}"

# df = spark.table(table_bronze).where("reference_date = :reference_date", {"reference_date": reference_date})
# before_count = df.count()
# df_dedup = df.dropDuplicates(["id", "reference_date"])
# after_count = df_dedup.count()
# if after_count > before_count:
#     raise ValueError("Contagem invalida apos deduplicacao")
# df_dedup.write.mode("overwrite").format("delta").option("replaceWhere", f"reference_date = '{reference_date}'").saveAsTable(table_silver)
logger.info("Silver preparado com validacao de duplicidade e escrita idempotente")
`
    },
    {
      relativePath: `${base}/03_gold_${name}.py`,
      content: `${commonHeader}
table_silver = f"{data_base}.silver_${name.replace('-', '_')}"
table_gold = f"{data_base}.gold_${name.replace('-', '_')}"

# df = spark.table(table_silver).where(f"reference_date = '{reference_date}'")
# before_count = df.count()
# df_gold = df.groupBy("reference_date").count()
# df_gold.write.mode("overwrite").format("delta").option("replaceWhere", f"reference_date = '{reference_date}'").saveAsTable(table_gold)
logger.info("Gold preparado com agregacao auditavel e sem secrets")
`
    },
    {
      relativePath: `${base}/data_quality.sql`,
      content: `-- Validacoes ORION para ${name}
-- Parametros esperados: :data_base, :reference_date

-- Contagem total
SELECT COUNT(*) AS total_registros
FROM IDENTIFIER(:data_base || '.silver_${name.replace('-', '_')}')
WHERE reference_date = :reference_date;

-- Duplicidade
SELECT id, reference_date, COUNT(*) AS qtd
FROM IDENTIFIER(:data_base || '.silver_${name.replace('-', '_')}')
WHERE reference_date = :reference_date
GROUP BY id, reference_date
HAVING COUNT(*) > 1;

-- Nulos obrigatorios
SELECT COUNT(*) AS registros_invalidos
FROM IDENTIFIER(:data_base || '.silver_${name.replace('-', '_')}')
WHERE reference_date = :reference_date
  AND id IS NULL;
`
    },
    {
      relativePath: `${base}/job.yml`,
      content: `# Job Databricks template ORION - sem workspace real e sem secrets
name: orion-${name}
parameters:
  data_base: ${defaultDataBase}
  reference_date: "2026-01-01"
tasks:
  - task_key: bronze
    notebook_task:
      notebook_path: ./01_bronze_${name}.py
  - task_key: silver
    depends_on:
      - task_key: bronze
    notebook_task:
      notebook_path: ./02_silver_${name}.py
  - task_key: gold
    depends_on:
      - task_key: silver
    notebook_task:
      notebook_path: ./03_gold_${name}.py
`
    },
    {
      relativePath: `${base}/README.md`,
      content: `# Pipeline ORION - ${name}

Pipeline Databricks padrao bronze/silver/gold para engenharia de riscos financeiros.

## Parametros
- data_base: base logica de desenvolvimento ou homologacao.
- reference_date: data de referencia da carga.

## Garantias do template
- Logs estruturados.
- Validacao de schema.
- Validacao de duplicidade.
- Contagens antes/depois.
- Escrita idempotente por reference_date.
- Sem secrets e sem acesso real a producao.
`
    }
  ];
}

export function buildDotnetApiFiles(inputName: string): GeneratedFile[] {
  const className = toPascalCase(inputName);
  const kebab = normalizeName(inputName);
  const base = `src/${className}.Api`;

  return [
    {
      relativePath: `${base}/Program.cs`,
      content: `using ${className}.Api.Repositories;
using ${className}.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddLogging();
builder.Services.AddScoped<I${className}Repository, ${className}Repository>();
builder.Services.AddScoped<I${className}Service, ${className}Service>();

var app = builder.Build();

app.MapGet("/${kebab}/{id}", async (string id, I${className}Service service, ILoggerFactory loggerFactory) =>
{
    var logger = loggerFactory.CreateLogger("ORION.${className}");
    try
    {
        var result = await service.GetAsync(id);
        return result is null ? Results.NotFound() : Results.Ok(result);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao consultar ${className} por {Id}", id);
        return Results.Problem("Erro interno ao consultar recurso.");
    }
});

app.Run();
`
    },
    {
      relativePath: `${base}/Models/${className}Dto.cs`,
      content: `namespace ${className}.Api.Models;

public sealed record ${className}Dto(string Id, DateOnly ReferenceDate, decimal Value, string Status);
`
    },
    {
      relativePath: `${base}/Services/${className}Service.cs`,
      content: `using ${className}.Api.Models;
using ${className}.Api.Repositories;

namespace ${className}.Api.Services;

public interface I${className}Service
{
    Task<${className}Dto?> GetAsync(string id);
}

public sealed class ${className}Service(I${className}Repository repository, ILogger<${className}Service> logger) : I${className}Service
{
    public async Task<${className}Dto?> GetAsync(string id)
    {
        logger.LogInformation("Consultando ${className} para {Id}", id);
        return await repository.GetAsync(id);
    }
}
`
    },
    {
      relativePath: `${base}/Repositories/${className}Repository.cs`,
      content: `using ${className}.Api.Models;

namespace ${className}.Api.Repositories;

public interface I${className}Repository
{
    Task<${className}Dto?> GetAsync(string id);
}

public sealed class ${className}Repository(ILogger<${className}Repository> logger) : I${className}Repository
{
    public Task<${className}Dto?> GetAsync(string id)
    {
        logger.LogInformation("Exemplo de query parametrizada para {Id}", id);
        const string sql = "SELECT id, reference_date, value, status FROM risco_table WHERE id = @id";
        _ = sql;

        ${className}Dto dto = new(id, DateOnly.FromDateTime(DateTime.UtcNow), 0m, "Template");
        return Task.FromResult<${className}Dto?>(dto);
    }
}
`
    },
    {
      relativePath: `${base}/README.md`,
      content: `# ${className}.Api

API .NET 8 Minimal API gerada pela ORION.

## Endpoint
- GET /${kebab}/{id}

## Padroes
- DTO, service e repository separados.
- Logs estruturados.
- Tratamento de erro no endpoint.
- Exemplo de query parametrizada.
- Sem secrets hardcoded.
`
    }
  ];
}

export function buildBlazorFiles(inputName: string): GeneratedFile[] {
  const className = toPascalCase(inputName);
  const kebab = normalizeName(inputName);
  const base = `src/${className}.Blazor`;

  return [
    {
      relativePath: `${base}/Pages/${className}.razor`,
      content: `@page "/${kebab}"
@inject ${className}Client Client

<h3>${className}</h3>

<input @bind="Filtro" placeholder="Filtrar por status" />
<button @onclick="CarregarAsync">Atualizar</button>

@if (Loading)
{
    <p>Carregando dados...</p>
}
else if (!string.IsNullOrWhiteSpace(Erro))
{
    <p class="text-danger">@Erro</p>
}
else if (Itens.Count == 0)
{
    <p>Nenhum registro encontrado.</p>
}
else
{
    <table class="table">
        <thead>
            <tr>
                <th>Id</th>
                <th>Data de referencia</th>
                <th>Valor</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach (var item in Itens)
            {
                <tr>
                    <td>@item.Id</td>
                    <td>@item.ReferenceDate</td>
                    <td>@item.Value</td>
                    <td>@item.Status</td>
                </tr>
            }
        </tbody>
    </table>
}

@code {
    private bool Loading { get; set; }
    private string? Erro { get; set; }
    private string Filtro { get; set; } = string.Empty;
    private List<${className}ViewModel> Itens { get; set; } = [];

    protected override async Task OnInitializedAsync() => await CarregarAsync();

    private async Task CarregarAsync()
    {
        Loading = true;
        Erro = null;
        try
        {
            Itens = await Client.GetAsync(Filtro);
        }
        catch (Exception ex)
        {
            Erro = $"Erro ao carregar dados: {ex.Message}";
        }
        finally
        {
            Loading = false;
        }
    }
}
`
    },
    {
      relativePath: `${base}/Services/${className}Client.cs`,
      content: `namespace ${className}.Blazor.Services;

public sealed class ${className}Client(HttpClient httpClient, ILogger<${className}Client> logger)
{
    public async Task<List<${className}ViewModel>> GetAsync(string filtro)
    {
        logger.LogInformation("Consultando dados Blazor com filtro {Filtro}", filtro);
        await Task.CompletedTask;

        return
        [
            new ${className}ViewModel("1", DateOnly.FromDateTime(DateTime.UtcNow), 0m, string.IsNullOrWhiteSpace(filtro) ? "Template" : filtro)
        ];
    }
}
`
    },
    {
      relativePath: `${base}/Models/${className}ViewModel.cs`,
      content: `namespace ${className}.Blazor.Models;

public sealed record ${className}ViewModel(string Id, DateOnly ReferenceDate, decimal Value, string Status);
`
    },
    {
      relativePath: `${base}/README.md`,
      content: `# ${className}.Blazor

Pagina Blazor gerada pela ORION.

## Estados cobertos
- Loading.
- Erro.
- Lista vazia.
- Tabela com dados.
- Filtro basico.

## Observacoes
Registre ${className}Client no DI do projeto Blazor real e configure HttpClient por ambiente sem secrets.
`
    }
  ];
}

export function buildTechnicalDocumentation(workspaceName: string): GeneratedFile[] {
  return [
    {
      relativePath: 'docs/technical-documentation.md',
      content: `# Documentacao Tecnica - ${workspaceName}

## Objetivo
Descrever a solucao, escopo funcional, dependencias e controles de engenharia.

## Arquitetura
- Componentes principais.
- Fluxo de dados.
- Integracoes.
- Contratos e formatos.

## Governanca e Seguranca
- Dados sensiveis tratados.
- Controles de acesso.
- Ausencia de secrets no repositorio.
- Evidencias de revisao.

## Operacao
- Como executar localmente.
- Logs e metricas.
- Plano de rollback.
- Checklist de implantacao.

## Testes
- Testes unitarios.
- Testes de integracao.
- Validacoes de qualidade de dados.
`
    }
  ];
}

export function buildStandardsMessage(): string {
  return `# Padroes ORION

- Modo local por padrao, sem APIs externas.
- Sem secrets, tokens ou endpoints produtivos em templates.
- Databricks com bronze/silver/gold, data_base, reference_date e validacoes.
- .NET, Java e Python com logs, tratamento de erro e testes.
- SQL parametrizado, colunas explicitas e validacoes de qualidade.
- Blazor com loading, erro, vazio e separacao de client/service/model.`;
}

export function buildChecklistMessage(): string {
  return `# Checklist ORION de producao

- Secrets removidos e configuracao por ambiente.
- Validacao de schema, duplicidade, nulos e contagens.
- Logs auditaveis sem PII.
- Testes automatizados executados.
- Documentacao tecnica atualizada.
- Plano de rollback definido.
- Revisao por pares registrada.`;
}

export function buildHelpMessage(): string {
  return `# ORION

Orquestrador de Riscos, Integracoes, Operacoes e Normas.

Comandos:
- @orion /help
- @orion /setup
- @orion /review
- @orion /pipeline <nome>
- @orion /api <nome>
- @orion /blazor <nome>
- @orion /doc
- @orion /standards
- @orion /checklist

Exemplos:
- @orion /pipeline risco credito
- @orion /api exposicao risco
- @orion /blazor acompanhamento limites`;
}
