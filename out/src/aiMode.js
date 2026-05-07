"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAiMode = resolveAiMode;
exports.shouldFallbackToLocalAnswer = shouldFallbackToLocalAnswer;
function resolveAiMode(configuredMode, freeConversation) {
    if (configuredMode === 'local' || configuredMode === 'copilot' || configuredMode === 'ollama') {
        return configuredMode;
    }
    return freeConversation ? 'ollama' : 'auto';
}
function shouldFallbackToLocalAnswer(freeConversation, configuredFallback) {
    return freeConversation ? false : configuredFallback;
}
//# sourceMappingURL=aiMode.js.map