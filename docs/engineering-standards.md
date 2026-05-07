# Padroes de Engenharia ORION

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
