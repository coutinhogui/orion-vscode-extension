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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const chat_1 = require("./chat");
const commands_1 = require("./commands");
const helpView_1 = require("./helpView");
function activate(context) {
    (0, commands_1.registerCommands)(context);
    (0, chat_1.registerChatParticipant)(context);
    const aiStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    aiStatus.text = '$(settings-gear) ORION IA';
    aiStatus.tooltip = 'Configurar IA da ORION e selecionar modelo Ollama instalado';
    aiStatus.command = 'orion.configureAi';
    aiStatus.show();
    context.subscriptions.push(aiStatus, vscode.window.registerWebviewViewProvider(helpView_1.OrionHelpViewProvider.viewType, new helpView_1.OrionHelpViewProvider(context)));
}
function deactivate() {
    // Nao ha recursos persistentes para liberar.
}
//# sourceMappingURL=extension.js.map