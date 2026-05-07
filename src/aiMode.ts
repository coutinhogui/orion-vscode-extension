export type OrionAiMode = 'auto' | 'local' | 'copilot' | 'ollama';
export type OrionConfigurationUpdateScope = 'global' | 'workspace' | 'workspaceFolder';

export interface OrionConfigurationInspection {
  readonly workspaceValue?: unknown;
  readonly workspaceFolderValue?: unknown;
}

export function resolveAiMode(configuredMode: string, freeConversation: boolean): OrionAiMode {
  if (configuredMode === 'local' || configuredMode === 'copilot' || configuredMode === 'ollama') {
    return configuredMode;
  }

  return freeConversation ? 'ollama' : 'auto';
}

export function shouldFallbackToLocalAnswer(freeConversation: boolean, configuredFallback: boolean): boolean {
  return freeConversation ? false : configuredFallback;
}

export function resolveConfigurationUpdateScope(inspection: OrionConfigurationInspection | undefined): OrionConfigurationUpdateScope {
  if (inspection?.workspaceFolderValue !== undefined) {
    return 'workspaceFolder';
  }

  if (inspection?.workspaceValue !== undefined) {
    return 'workspace';
  }

  return 'global';
}
