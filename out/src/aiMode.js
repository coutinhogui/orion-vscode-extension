"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAiMode = resolveAiMode;
exports.shouldFallbackToLocalAnswer = shouldFallbackToLocalAnswer;
exports.resolveConfigurationUpdateScope = resolveConfigurationUpdateScope;
function resolveAiMode(configuredMode, freeConversation) {
    if (configuredMode === 'local' || configuredMode === 'copilot' || configuredMode === 'ollama') {
        return configuredMode;
    }
    return freeConversation ? 'ollama' : 'auto';
}
function shouldFallbackToLocalAnswer(freeConversation, configuredFallback) {
    return freeConversation ? false : configuredFallback;
}
function resolveConfigurationUpdateScope(inspection) {
    if (inspection?.workspaceFolderValue !== undefined) {
        return 'workspaceFolder';
    }
    if (inspection?.workspaceValue !== undefined) {
        return 'workspace';
    }
    return 'global';
}
//# sourceMappingURL=aiMode.js.map