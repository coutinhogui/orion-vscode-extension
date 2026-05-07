"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAiDiagnosticsReport = buildAiDiagnosticsReport;
function status(value) {
    return value ? 'OK' : 'FALHOU';
}
function buildAiDiagnosticsReport(input) {
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
//# sourceMappingURL=diagnostics.js.map