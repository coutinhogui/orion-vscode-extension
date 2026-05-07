export interface CopilotHistoryMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

export type OrionInternetMode = 'off' | 'ask' | 'auto';

export interface CopilotPromptInput {
  readonly command: string;
  readonly userPrompt: string;
  readonly localAnswer: string;
  readonly internetMode: OrionInternetMode;
  readonly internalDocsContext: string;
  readonly history: readonly CopilotHistoryMessage[];
}

export function buildCopilotPrompt(input: CopilotPromptInput): string {
  const history = input.history
    .slice(-6)
    .map((item) => `${formatHistoryRole(item.role)}: ${item.content}`)
    .join('\n');
  const commandContext = input.command ? `Comando ORION detectado: /${input.command}` : 'Conversa livre sem comando ORION explicito.';

  return [
    'Voce e a ORION operando pelo modo Copilot no VS Code.',
    'Responda diretamente ao pedido original do usuario em portugues brasileiro.',
    'Use a resposta/base local da ORION como contexto, mas nao fique preso a ela se o pedido precisar de raciocinio melhor.',
    'Nao diga que usou Ollama. Nao invente acesso a sistemas internos, dados privados, producao ou internet em tempo real.',
    internetPolicyInstruction(input.internetMode),
    '',
    `Contexto de roteamento: ${commandContext}`,
    `Politica de internet: ${input.internetMode}`,
    '',
    input.internalDocsContext || 'Documentacao interna ORION: nao consultada.',
    '',
    'Historico recente:',
    history || 'Sem historico recente.',
    '',
    'Pedido original do usuario:',
    input.userPrompt || '(sem texto adicional)',
    '',
    'Resposta/base local da ORION:',
    input.localAnswer
  ].join('\n');
}

function internetPolicyInstruction(mode: OrionInternetMode): string {
  switch (mode) {
    case 'auto':
      return 'Internet configurada como auto: use somente evidencias externas que a ORION fornecer explicitamente no contexto; nao invente pesquisa se nenhuma fonte externa foi fornecida.';
    case 'ask':
      return 'Internet configurada como ask: se o pedido exigir informacao atual ou fonte externa, explique que precisa de autorizacao antes de pesquisar.';
    default:
      return 'Internet configurada como off: Nao afirme que pesquisou na internet. Se o pedido exigir informacao atual ou fonte externa, diga que a internet esta desligada na ORION.';
  }
}

function formatHistoryRole(role: CopilotHistoryMessage['role']): string {
  switch (role) {
    case 'user':
      return 'Usuario';
    case 'system':
      return 'Sistema';
    default:
      return 'ORION';
  }
}
