import * as vscode from 'vscode';
import * as path from 'path';
import { renderOrionHelpHtml } from './helpHtml';
import { chooseOllamaModel, probeOllamaConnection } from './ollama';
import { AiPanelStatus, AiRuntimeInfo, buildAiPanelStatus } from './aiStatus';

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

export async function getAiStatus(context: vscode.ExtensionContext): Promise<AiPanelStatus> {
  const mode = vscode.workspace.getConfiguration('orion.ai').get<string>('mode', 'auto');
  const baseUrl = vscode.workspace.getConfiguration('orion.ollama').get<string>('baseUrl', 'http://localhost:11434');
  const configuredModel = vscode.workspace.getConfiguration('orion.ollama').get<string>('model', 'qwen2.5-coder:3b');
  const runtime = getRuntimeInfo(context);

  if (mode !== 'ollama') {
    return buildAiPanelStatus({
      mode,
      baseUrl,
      configuredModel,
      runtime
    });
  }

  const probe = await probeOllamaConnection(baseUrl);
  const resolvedModel = chooseOllamaModel(configuredModel, probe.models);

  return buildAiPanelStatus({
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

function getRuntimeInfo(context: vscode.ExtensionContext): AiRuntimeInfo {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  return {
    version: String(context.extension.packageJSON.version ?? 'desconhecida'),
    extensionPath: context.extensionUri.fsPath,
    globalStoragePath: context.globalStorageUri.fsPath,
    workspaceConfigPath: workspaceRoot ? path.join(workspaceRoot, '.vscode', 'settings.json') : 'sem workspace aberto'
  };
}
