import * as vscode from 'vscode';
import { renderOrionHelpHtml } from './helpHtml';
import { chooseOllamaModel, probeOllamaConnection } from './ollama';

interface OrionAiStatus {
  readonly type: 'aiStatus';
  readonly mode: string;
  readonly model: string;
  readonly baseUrl: string;
  readonly status: string;
  readonly ok: boolean;
}

export class OrionHelpViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'orionHelp';

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = renderOrionHelpHtml();
    webviewView.webview.onDidReceiveMessage(async (message: { command?: string }) => {
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

export async function getAiStatus(): Promise<OrionAiStatus> {
  const mode = vscode.workspace.getConfiguration('orion.ai').get<string>('mode', 'auto');
  const baseUrl = vscode.workspace.getConfiguration('orion.ollama').get<string>('baseUrl', 'http://localhost:11434');
  const configuredModel = vscode.workspace.getConfiguration('orion.ollama').get<string>('model', 'qwen2.5-coder:3b');

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

  const probe = await probeOllamaConnection(baseUrl);
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

  const resolvedModel = chooseOllamaModel(configuredModel, probe.models);
  return {
    type: 'aiStatus',
    mode,
    model: resolvedModel === configuredModel ? configuredModel : `${resolvedModel} (auto)`,
    baseUrl,
    status: probe.models.includes(configuredModel) ? 'conectado' : 'modelo configurado ausente',
    ok: true
  };
}
