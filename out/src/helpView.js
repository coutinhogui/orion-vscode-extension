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
exports.OrionHelpViewProvider = void 0;
exports.getAiStatus = getAiStatus;
const vscode = __importStar(require("vscode"));
const helpHtml_1 = require("./helpHtml");
const ollama_1 = require("./ollama");
class OrionHelpViewProvider {
    static viewType = 'orionHelp';
    resolveWebviewView(webviewView) {
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = (0, helpHtml_1.renderOrionHelpHtml)();
        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'getAiStatus') {
                await webviewView.webview.postMessage(await getAiStatus());
                return;
            }
            if (message.command) {
                await vscode.commands.executeCommand(message.command);
                await webviewView.webview.postMessage(await getAiStatus());
            }
        });
    }
}
exports.OrionHelpViewProvider = OrionHelpViewProvider;
async function getAiStatus() {
    const mode = vscode.workspace.getConfiguration('orion.ai').get('mode', 'auto');
    const baseUrl = vscode.workspace.getConfiguration('orion.ollama').get('baseUrl', 'http://localhost:11434');
    const configuredModel = vscode.workspace.getConfiguration('orion.ollama').get('model', 'qwen2.5-coder:3b');
    if (mode !== 'ollama' && mode !== 'auto') {
        return {
            type: 'aiStatus',
            mode,
            model: configuredModel,
            baseUrl,
            status: mode === 'local' ? 'modo local ativo' : 'sem teste Ollama',
            ok: mode === 'local'
        };
    }
    const probe = await (0, ollama_1.probeOllamaConnection)(baseUrl);
    if (!probe.ok) {
        return {
            type: 'aiStatus',
            mode,
            model: configuredModel,
            baseUrl,
            status: 'Ollama desconectado',
            ok: false
        };
    }
    const resolvedModel = (0, ollama_1.chooseOllamaModel)(configuredModel, probe.models);
    return {
        type: 'aiStatus',
        mode,
        model: resolvedModel === configuredModel ? configuredModel : `${resolvedModel} (auto)`,
        baseUrl,
        status: probe.models.includes(configuredModel) ? 'conectado' : 'modelo configurado ausente',
        ok: true
    };
}
//# sourceMappingURL=helpView.js.map