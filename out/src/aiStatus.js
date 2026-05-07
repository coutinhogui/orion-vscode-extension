"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAiPanelStatus = buildAiPanelStatus;
const configureAiAction = {
    label: 'Configurar IA',
    description: 'Escolher Auto, Local, Copilot ou Ollama',
    command: 'orion.configureAi',
    icon: 'AI'
};
const openChatAction = {
    label: 'Abrir @orion',
    description: 'Usar o participante ORION no Chat',
    command: 'workbench.panel.chat.view.copilot.focus',
    icon: '@'
};
function buildAiPanelStatus(input) {
    switch (input.mode) {
        case 'local':
            return buildLocalStatus(input);
        case 'copilot':
            return buildCopilotStatus(input);
        case 'ollama':
            return buildOllamaStatus(input);
        default:
            return buildAutoStatus(input);
    }
}
function buildLocalStatus(input) {
    return {
        type: 'aiStatus',
        mode: input.mode,
        providerLabel: 'Local',
        summary: 'Respostas locais e comandos ORION sem provider de modelo.',
        status: 'modo local ativo',
        ok: true,
        details: [
            { label: 'Modo', value: 'Local' },
            { label: 'Provider', value: 'Nenhum provider externo' },
            { label: 'Uso', value: 'Templates, revisao e respostas locais' }
        ],
        actions: [configureAiAction, openChatAction],
        runtime: input.runtime
    };
}
function buildCopilotStatus(input) {
    return {
        type: 'aiStatus',
        mode: input.mode,
        providerLabel: 'Copilot',
        summary: 'Usa a Language Model API do VS Code quando o Chat fornece um modelo.',
        status: 'Copilot selecionado',
        ok: true,
        details: [
            { label: 'Modo', value: 'Copilot' },
            { label: 'Provider', value: 'VS Code Language Model API' },
            { label: 'Fallback', value: 'Resposta local se o modelo nao estiver disponivel' }
        ],
        actions: [configureAiAction, openChatAction],
        runtime: input.runtime
    };
}
function buildAutoStatus(input) {
    return {
        type: 'aiStatus',
        mode: input.mode,
        providerLabel: 'Auto',
        summary: 'Seleciona a rota conforme o pedido: comandos ORION primeiro, conversa livre depois.',
        status: 'politica automatica ativa',
        ok: true,
        details: [
            { label: 'Modo', value: 'Auto' },
            { label: 'Prioridade', value: 'Recursos ORION quando houver intenção clara' },
            { label: 'Fallback', value: 'Resposta de modelo conforme politica interna' }
        ],
        actions: [configureAiAction, openChatAction],
        runtime: input.runtime
    };
}
function buildOllamaStatus(input) {
    const probe = input.ollama;
    const ok = Boolean(probe?.ok);
    const resolvedModel = probe?.resolvedModel ?? input.configuredModel;
    const status = !probe
        ? 'Ollama nao verificado'
        : ok
            ? (probe.modelPresent ? 'conectado' : 'modelo configurado ausente')
            : 'Ollama desconectado';
    return {
        type: 'aiStatus',
        mode: input.mode,
        providerLabel: 'Ollama',
        summary: ok ? 'Servidor local Ollama selecionado para respostas de modelo.' : 'Modo Ollama selecionado, mas o servidor nao respondeu.',
        status,
        ok,
        details: [
            { label: 'Modo', value: 'Ollama' },
            { label: 'Servidor', value: input.baseUrl },
            { label: 'Modelo', value: resolvedModel === input.configuredModel ? input.configuredModel : `${resolvedModel} (auto)` },
            { label: 'Modelos', value: probe ? `${probe.modelCount}` : 'nao verificado' }
        ],
        actions: [
            configureAiAction,
            {
                label: 'Modelos Ollama',
                description: 'Selecionar modelo instalado',
                command: 'orion.selectOllamaModel',
                icon: 'M'
            },
            {
                label: 'Testar Ollama',
                description: 'Validar servidor local configurado',
                command: 'orion.testOllamaConnection',
                icon: 'T'
            }
        ],
        runtime: input.runtime
    };
}
//# sourceMappingURL=aiStatus.js.map