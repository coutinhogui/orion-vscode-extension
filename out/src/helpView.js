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
const path = __importStar(require("path"));
const helpHtml_1 = require("./helpHtml");
const ollama_1 = require("./ollama");
const aiStatus_1 = require("./aiStatus");
class OrionHelpViewProvider {
    context;
    static viewType = 'orionHelp';
    constructor(context) {
        this.context = context;
    }
    resolveWebviewView(webviewView) {
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = (0, helpHtml_1.renderOrionHelpHtml)();
        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'getAiStatus') {
                await webviewView.webview.postMessage(await getAiStatus(this.context));
                return;
            }
            if (message.command) {
                await vscode.commands.executeCommand(message.command);
                await webviewView.webview.postMessage(await getAiStatus(this.context));
            }
        });
    }
}
exports.OrionHelpViewProvider = OrionHelpViewProvider;
async function getAiStatus(context) {
    const mode = vscode.workspace.getConfiguration('orion.ai').get('mode', 'auto');
    const baseUrl = vscode.workspace.getConfiguration('orion.ollama').get('baseUrl', 'http://localhost:11434');
    const configuredModel = vscode.workspace.getConfiguration('orion.ollama').get('model', 'qwen2.5-coder:3b');
    const runtime = getRuntimeInfo(context);
    if (mode !== 'ollama') {
        return (0, aiStatus_1.buildAiPanelStatus)({
            mode,
            baseUrl,
            configuredModel,
            runtime
        });
    }
    const probe = await (0, ollama_1.probeOllamaConnection)(baseUrl);
    const resolvedModel = (0, ollama_1.chooseOllamaModel)(configuredModel, probe.models);
    return (0, aiStatus_1.buildAiPanelStatus)({
        mode,
        baseUrl,
        configuredModel,
        runtime,
        ollama: {
            ok: probe.ok,
            resolvedModel,
            modelPresent: probe.models.includes(configuredModel),
            modelCount: probe.models.length
        }
    });
}
function getRuntimeInfo(context) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    return {
        version: String(context.extension.packageJSON.version ?? 'desconhecida'),
        extensionPath: context.extensionUri.fsPath,
        globalStoragePath: context.globalStorageUri.fsPath,
        workspaceConfigPath: workspaceRoot ? path.join(workspaceRoot, '.vscode', 'settings.json') : 'sem workspace aberto'
    };
}
//# sourceMappingURL=helpView.js.map