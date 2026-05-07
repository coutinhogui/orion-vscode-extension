export type OrionAiMode = 'auto' | 'local' | 'copilot' | 'ollama';

export function resolveAiMode(configuredMode: string, freeConversation: boolean): OrionAiMode {
  if (configuredMode === 'local' || configuredMode === 'copilot' || configuredMode === 'ollama') {
    return configuredMode;
  }

  return freeConversation ? 'ollama' : 'auto';
}

export function shouldFallbackToLocalAnswer(freeConversation: boolean, configuredFallback: boolean): boolean {
  return freeConversation ? false : configuredFallback;
}
