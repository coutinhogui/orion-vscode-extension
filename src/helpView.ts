import * as vscode from 'vscode';
import * as path from 'path';
import { renderOrionHelpHtml } from './helpHtml';
import { chooseOllamaModel, probeOllamaConnection } from './ollama';

interface OrionAiStatus {
  readonly type: 'aiStatus';
  readonly mode: string;
  readonly model: string;
  readonly baseUrl: string;
  readonly status: string;
  readonly ok: boolean;
  readonly version: string;
  readonly extensionPath: string;
  readonly globalStoragePath: string;
  readonly workspaceConfigPath: string;
}

export class OrionHelpViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'orionHelp';

  public constructor(private readonly context: vscode.ExtensionContext) {}

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = renderOrionHelpHtml();
    webviewView.webview.onDidReceiveMessage(async (message: { command?: string }) => {
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

export async function getAiStatus(context: vscode.ExtensionContext): Promise<OrionAiStatus> {
  const mode = vscode.workspace.getConfiguration('orion.ai').get<string>('mode', 'auto');
  const baseUrl = vscode.workspace.getConfiguration('orion.ollama').get<string>('baseUrl', 'http://localhost:11434');
  const configuredModel = vscode.workspace.getConfiguration('orion.ollama').get<string>('model', 'qwen2.5-coder:3b');
  const runtime = getRuntimeInfo(context);

  if (mode !== 'ollama' && mode !== 'auto') {
    return {
      type: 'aiStatus',
      mode,
      model: configuredModel,
      baseUrl,
      status: mode === 'local' ? 'modo local ativo' : 'sem teste Ollama',
      ok: mode === 'local',
      ...runtime
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
      ok: false,
      ...runtime
    };
  }

  const resolvedModel = chooseOllamaModel(configuredModel, probe.models);
  return {
    type: 'aiStatus',
    mode,
    model: resolvedModel === configuredModel ? configuredModel : `${resolvedModel} (auto)`,
    baseUrl,
    status: probe.models.includes(configuredModel) ? 'conectado' : 'modelo configurado ausente',
    ok: true,
    ...runtime
  };
}

function getRuntimeInfo(context: vscode.ExtensionContext): Pick<OrionAiStatus, 'version' | 'extensionPath' | 'globalStoragePath' | 'workspaceConfigPath'> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  return {
    version: String(context.extension.packageJSON.version ?? 'desconhecida'),
    extensionPath: context.extensionUri.fsPath,
    globalStoragePath: context.globalStorageUri.fsPath,
    workspaceConfigPath: workspaceRoot ? path.join(workspaceRoot, '.vscode', 'settings.json') : 'sem workspace aberto'
  };
}
