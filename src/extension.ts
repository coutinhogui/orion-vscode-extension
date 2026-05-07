import * as vscode from 'vscode';
import { registerChatParticipant } from './chat';
import { registerCommands } from './commands';
import { OrionHelpViewProvider } from './helpView';

export function activate(context: vscode.ExtensionContext): void {
  registerCommands(context);
  registerChatParticipant(context);
  const aiStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  aiStatus.text = '$(settings-gear) ORION IA';
  aiStatus.tooltip = 'Configurar IA da ORION e selecionar modelo Ollama instalado';
  aiStatus.command = 'orion.configureAi';
  aiStatus.show();
  context.subscriptions.push(
    aiStatus,
    vscode.window.registerWebviewViewProvider(OrionHelpViewProvider.viewType, new OrionHelpViewProvider())
  );
}

export function deactivate(): void {
  // Nao ha recursos persistentes para liberar.
}
