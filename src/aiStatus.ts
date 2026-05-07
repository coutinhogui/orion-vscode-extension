export interface AiRuntimeInfo {
  readonly version: string;
  readonly extensionPath: string;
  readonly globalStoragePath: string;
  readonly workspaceConfigPath: string;
}

export interface AiPanelDetail {
  readonly label: string;
  readonly value: string;
}

export interface AiPanelAction {
  readonly label: string;
  readonly description: string;
  readonly command: string;
  readonly icon: string;
}

export interface OllamaPanelProbe {
  readonly ok: boolean;
  readonly resolvedModel: string;
  readonly modelPresent: boolean;
  readonly modelCount: number;
}

export interface AiPanelStatusInput {
  readonly mode: string;
  readonly baseUrl: string;
  readonly configuredModel: string;
  readonly runtime: AiRuntimeInfo;
  readonly ollama?: OllamaPanelProbe;
}

export interface AiPanelStatus {
  readonly type: 'aiStatus';
  readonly mode: string;
  readonly providerLabel: string;
  readonly summary: string;
  readonly status: string;
  readonly ok: boolean;
  readonly details: readonly AiPanelDetail[];
  readonly actions: readonly AiPanelAction[];
  readonly runtime: AiRuntimeInfo;
}

const configureAiAction: AiPanelAction = {
  label: 'Configurar IA',
  description: 'Escolher Auto, Local, Copilot ou Ollama',
  command: 'orion.configureAi',
  icon: 'AI'
};

const openChatAction: AiPanelAction = {
  label: 'Abrir @orion',
  description: 'Usar o participante ORION no Chat',
  command: 'workbench.panel.chat.view.copilot.focus',
  icon: '@'
};

export function buildAiPanelStatus(input: AiPanelStatusInput): AiPanelStatus {
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

function buildLocalStatus(input: AiPanelStatusInput): AiPanelStatus {
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

function buildCopilotStatus(input: AiPanelStatusInput): AiPanelStatus {
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

function buildAutoStatus(input: AiPanelStatusInput): AiPanelStatus {
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

function buildOllamaStatus(input: AiPanelStatusInput): AiPanelStatus {
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
