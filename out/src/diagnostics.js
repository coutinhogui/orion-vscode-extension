"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAiDiagnosticsReport = buildAiDiagnosticsReport;
function status(value) {
    return value ? 'OK' : 'FALHOU';
}
function buildAiDiagnosticsReport(input) {
    if (input.mode === 'local') {
        return [
            '# Diagnostico ORION IA',
            '',
            '## Configuracao',
            '- Modo configurado: local',
            '- Provider ativo: nenhum provider externo',
            '- Comportamento: respostas locais, templates e revisoes sem chamada de modelo.',
            '',
            '## Proximas acoes',
            '- Use `ORION: Configurar IA e Selecionar Modelo` para mudar para Auto, Copilot ou Ollama.'
        ].join('\n');
    }
    if (input.mode === 'copilot') {
        return [
            '# Diagnostico ORION IA',
            '',
            '## Configuracao',
            '- Modo configurado: copilot',
            '- Provider ativo: VS Code Language Model API',
            '- Comportamento: a ORION usa o modelo fornecido pelo Chat quando disponivel.',
            '- Fallback: resposta local se o Chat nao fornecer `request.model`.',
            '',
            '## Proximas acoes',
            '- Abra o Chat do VS Code/Cursor e use `@orion` para validar o modelo Copilot em contexto real.',
            '- Use `ORION: Abrir Logs` se a resposta cair para fallback local.'
        ].join('\n');
    }
    if (input.mode !== 'ollama') {
        return [
            '# Diagnostico ORION IA',
            '',
            '## Configuracao',
            `- Modo configurado: ${input.mode}`,
            '- Provider ativo: automatico',
            '- Comportamento: a ORION prioriza recursos locais quando detecta intencao clara e usa a politica interna para conversa livre.',
            '',
            '## Proximas acoes',
            '- Use `ORION: Configurar IA e Selecionar Modelo` para fixar Local, Copilot ou Ollama.'
        ].join('\n');
    }
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