"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatParticipant = registerChatParticipant;
exports.extractOllamaHistory = extractOllamaHistory;
const vscode = __importStar(require("vscode"));
const commands_1 = require("./commands");
const templates_1 = require("./templates");
const ollama_1 = require("./ollama");
const conversation_1 = require("./conversation");
const aiMode_1 = require("./aiMode");
const resourceIntent_1 = require("./resourceIntent");
const logging_1 = require("./logging");
const output_1 = require("./output");
function registerChatParticipant(context) {
    const chatApi = vscode.chat;
    if (!chatApi?.createChatParticipant) {
        return;
    }
    const participant = chatApi.createChatParticipant('orion', async (request, context, response, token) => {
        const command = String(request.command ?? '').toLowerCase();
        const prompt = String(request.prompt ?? '').trim();
        try {
            (0, output_1.logOrion)('info', 'chat request received', { command: command || 'free', prompt: (0, logging_1.summarizeText)(prompt), historyTurns: Array.isArray(context?.history) ? context.history.length : 0 });
            const intent = command ? undefined : (0, resourceIntent_1.detectResourceIntent)(prompt);
            const resolvedCommand = intent?.command ?? command;
            const resolvedPrompt = intent?.prompt ?? prompt;
            if (intent) {
                (0, output_1.logOrion)('info', 'resource intent detected', { command: resolvedCommand, prompt: (0, logging_1.summarizeText)(resolvedPrompt) });
            }
            const local = await handleLocalCommand(resolvedCommand, resolvedPrompt);
            await maybeUseLanguageModel(request, resolvedCommand, local, prompt, response, token, extractOllamaHistory(context));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, output_1.logOrion)('error', 'chat request failed', { error: message });
            response.markdown(`ORION encontrou um erro: ${message}`);
        }
    });
    participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'resources', 'orion.svg');
    context.subscriptions.push(participant);
}
async function handleLocalCommand(command, prompt) {
    switch (command) {
        case '':
            return (0, conversation_1.buildConversationReply)(prompt);
        case 'help':
            return (0, templates_1.buildHelpMessage)();
        case 'setup':
            return await (0, commands_1.setupWorkspaceCommand)();
        case 'review':
            return await (0, commands_1.reviewCurrentFileCommand)();
        case 'pipeline':
            return await (0, commands_1.createDatabricksPipelineCommand)(prompt);
        case 'api':
            return await (0, commands_1.createDotnetApiCommand)(prompt);
        case 'blazor':
            return await (0, commands_1.createBlazorPageCommand)(prompt);
        case 'doc':
            return await (0, commands_1.generateTechnicalDocumentationCommand)();
        case 'standards':
            return (0, templates_1.buildStandardsMessage)();
        case 'checklist':
            return (0, templates_1.buildChecklistMessage)();
        default:
            return `${(0, templates_1.buildHelpMessage)()}\n\nComando nao reconhecido: /${command}`;
    }
}
function stringifyChatContent(value) {
    if (typeof value === 'string') {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((item) => stringifyChatContent(item)).filter(Boolean).join('\n');
    }
    if (value && typeof value === 'object') {
        const record = value;
        return stringifyChatContent(record.value ?? record.content ?? record.markdown ?? record.text);
    }
    return '';
}
function extractOllamaHistory(context) {
    const turns = Array.isArray(context?.history) ? context.history : [];
    const messages = [];
    for (const turn of turns.slice(-6)) {
        const prompt = stringifyChatContent(turn?.prompt ?? turn?.request?.prompt);
        if (prompt.trim()) {
            messages.push({ role: 'user', content: prompt.trim() });
        }
        const answer = stringifyChatContent(turn?.response ?? turn?.result ?? turn?.answer);
        if (answer.trim()) {
            messages.push({ role: 'assistant', content: answer.trim() });
        }
    }
    return messages.slice(-6);
}
async function maybeUseLanguageModel(request, command, localAnswer, prompt, response, token, history) {
    const configuredMode = vscode.workspace.getConfiguration('orion.ai').get('mode', 'auto');
    const freeConversation = command === '';
    const mode = (0, aiMode_1.resolveAiMode)(configuredMode, freeConversation);
    (0, output_1.logOrion)('info', 'ai mode resolved', { configuredMode, mode, freeConversation });
    if (mode === 'local') {
        (0, output_1.logOrion)('info', 'local response used', { command: command || 'free' });
        response.markdown(localAnswer);
        return;
    }
    if (mode === 'ollama') {
        const baseUrl = vscode.workspace.getConfiguration('orion.ollama').get('baseUrl', 'http://localhost:11434');
        const configuredModel = vscode.workspace.getConfiguration('orion.ollama').get('model', 'qwen2.5-coder:3b');
        const probe = await (0, ollama_1.probeOllamaConnection)(baseUrl);
        const model = (0, ollama_1.chooseOllamaModel)(configuredModel, probe.models);
        (0, output_1.logOrion)(probe.ok ? 'info' : 'warn', 'ollama probe before chat', { ok: probe.ok, baseUrl, configuredModel, resolvedModel: model, modelCount: probe.models.length });
        const configuredFallback = vscode.workspace.getConfiguration('orion.ollama').get('autoFallbackToLocal', true);
        const autoFallbackToLocal = (0, aiMode_1.shouldFallbackToLocalAnswer)(freeConversation, configuredFallback);
        let streamed = '';
        if (typeof response.progress === 'function' && freeConversation) {
            response.progress('Consultando Ollama e revisando a resposta...');
        }
        const ollamaAnswer = freeConversation
            ? await (0, ollama_1.streamOllamaResponse)(baseUrl, model, localAnswer, prompt, (chunk) => {
                streamed += chunk;
                response.markdown(chunk);
            }, true, autoFallbackToLocal, history)
            : await (0, ollama_1.streamOllamaResponse)(baseUrl, model, localAnswer, prompt, (chunk) => {
                streamed += chunk;
                response.markdown(chunk);
            }, false, autoFallbackToLocal, history);
        if (!streamed.trim()) {
            (0, output_1.logOrion)(ollamaAnswer ? 'warn' : 'error', 'ollama stream produced no chunks', { model, fallback: Boolean(ollamaAnswer), freeConversation });
            response.markdown(ollamaAnswer || (0, ollama_1.buildOllamaFallbackMessage)(model, baseUrl));
        }
        return;
    }
    if (!request.model?.sendRequest) {
        (0, output_1.logOrion)('warn', 'copilot model unavailable; local response used', { command: command || 'free' });
        response.markdown(localAnswer);
        return;
    }
    try {
        const messages = [
            vscode.LanguageModelChatMessage.User(`Melhore a resposta abaixo em portugues brasileiro, mantendo seguranca, governanca, modo local por padrao e sem inventar acessos externos.\n\n${localAnswer}`)
        ];
        const result = await request.model.sendRequest(messages, {}, token);
        let text = '';
        for await (const fragment of result.text) {
            text += fragment;
        }
        response.markdown(text.trim() || localAnswer);
        return;
    }
    catch {
        (0, output_1.logOrion)('warn', 'copilot request failed; local response used', { command: command || 'free' });
        response.markdown(localAnswer);
        return;
    }
}
//# sourceMappingURL=chat.js.map