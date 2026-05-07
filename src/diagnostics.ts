export interface AiDiagnosticsInput {
  readonly mode: string;
  readonly baseUrl: string;
  readonly configuredModel: string;
  readonly resolvedModel: string;
  readonly tagsOk: boolean;
  readonly models: readonly string[];
  readonly completionOk: boolean;
  readonly completionMessage: string;
}

function status(value: boolean): string {
  return value ? 'OK' : 'FALHOU';
}

export function buildAiDiagnosticsReport(input: AiDiagnosticsInput): string {
  const modelList = input.models.length > 0
    ? input.models.map((model) => `- ${model}`).join('\n')
    : '- Nenhum modelo retornado.';

  return [
    '# Diagnostico ORION IA',
    '',
    '## Configuracao',
    `- Modo configurado: ${input.mode}`,
    `- Servidor Ollama: ${input.baseUrl}`,
    `- Modelo configurado: ${input.configuredModel}`,
    `- Modelo efetivo: ${input.resolvedModel}`,
    '',
    '## /api/tags',
    `- Status: ${status(input.tagsOk)}`,
    '- Modelos detectados:',
    modelList,
    '',
    '## /v1/chat/completions',
    `- Status: ${status(input.completionOk)}`,
    `- Resultado: ${input.completionMessage}`,
    '',
    '## Proximas acoes',
    input.tagsOk ? '- O servidor Ollama respondeu a listagem de modelos.' : '- Abra o Ollama e confira se a URL base esta correta.',
    input.completionOk ? '- O modelo efetivo respondeu ao teste de chat.' : '- Selecione outro modelo com `ORION: Selecionar Modelo Ollama Instalado` ou baixe o modelo configurado.'
  ].join('\n');
}
