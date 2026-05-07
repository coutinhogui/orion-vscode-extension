"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectResourceIntent = detectResourceIntent;
function cleanupResourceName(value) {
    return value
        .replace(/^(para|de|do|da|dos|das|um|uma|o|a)\s+/i, '')
        .trim();
}
function detectResourceIntent(prompt) {
    const normalized = prompt.trim().toLowerCase();
    if (!normalized) {
        return undefined;
    }
    if (/\b(configurar|prepare|preparar|setup)\b.*\b(workspace|projeto|ambiente)\b/.test(normalized)) {
        return { command: 'setup', prompt: '' };
    }
    if (/\b(revisar|revise|review|analisar|analise)\b.*\b(arquivo|codigo|c[oó]digo|aberto|atual)\b/.test(normalized)) {
        return { command: 'review', prompt: '' };
    }
    if (/\b(documenta[cç][aã]o|documentar|docs?)\b/.test(normalized) && /\b(gerar|criar|fa[cç]a|monte)\b/.test(normalized)) {
        return { command: 'doc', prompt: '' };
    }
    if (/\b(padr[oõ]es|standards?)\b/.test(normalized)) {
        return { command: 'standards', prompt: '' };
    }
    if (/\b(checklist|lista de valida[cç][aã]o)\b/.test(normalized)) {
        return { command: 'checklist', prompt: '' };
    }
    const pipelineMatch = normalized.match(/\b(?:crie|criar|gere|gerar|monte|fazer|fa[cç]a)\b.*\b(?:pipeline|databricks)\b(?:\s+(.*))?$/);
    if (pipelineMatch) {
        return { command: 'pipeline', prompt: cleanupResourceName(pipelineMatch[1] ?? '') };
    }
    const apiMatch = normalized.match(/\b(?:crie|criar|gere|gerar|monte|fazer|fa[cç]a)\b.*\b(?:api|minimal api|endpoint)\b(?:\s+(.*))?$/);
    if (apiMatch) {
        return { command: 'api', prompt: cleanupResourceName(apiMatch[1] ?? '') };
    }
    const blazorMatch = normalized.match(/\b(?:crie|criar|gere|gerar|monte|fazer|fa[cç]a)\b.*\b(?:blazor|pagina|p[aá]gina)\b(?:\s+(.*))?$/);
    if (blazorMatch) {
        return { command: 'blazor', prompt: cleanupResourceName(blazorMatch[1] ?? '') };
    }
    return undefined;
}
//# sourceMappingURL=resourceIntent.js.map