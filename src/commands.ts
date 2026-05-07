import * as vscode from 'vscode';
import { buildBlazorFiles, buildCopilotInstructions, buildDatabricksPipelineFiles, buildDotnetApiFiles, buildTechnicalDocumentation, buildWorkspaceSetupFiles } from './templates';
import { formatReview, isSupportedForReview, reviewText } from './review';
import { getDefaultDataBase, getOverwriteSetting, workspaceDisplayName, writeGeneratedFiles } from './workspace';
import { buildOllamaModelQuickPickItems, chooseOllamaModel, generateOllamaResponse, probeOllamaConnection } from './ollama';
import { buildAiDiagnosticsReport } from './diagnostics';
import { logOrion, showOrionLogs } from './output';
import { buildFirstUseGuide } from './firstUseGuide';
import { OrionConfigurationUpdateScope, resolveConfigurationUpdateScope } from './aiMode';

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('orion.openHelp', () => vscode.commands.executeCommand('orionHelp.focus')),
    vscode.commands.registerCommand('orion.openFirstUseGuide', openFirstUseGuideCommand),
    vscode.commands.registerCommand('orion.showLogs', showOrionLogs),
    vscode.commands.registerCommand('orion.setupWorkspace', setupWorkspaceCommand),
    vscode.commands.registerCommand('orion.reviewCurrentFile', reviewCurrentFileCommand),
    vscode.commands.registerCommand('orion.createDatabricksPipeline', createDatabricksPipelineCommand),
    vscode.commands.registerCommand('orion.generateCopilotInstructions', generateCopilotInstructionsCommand),
    vscode.commands.registerCommand('orion.generateTechnicalDocumentation', generateTechnicalDocumentationCommand),
    vscode.commands.registerCommand('orion.createDotnetApi', createDotnetApiCommand),
    vscode.commands.registerCommand('orion.createBlazorPage', createBlazorPageCommand),
    vscode.commands.registerCommand('orion.testOllamaConnection', testOllamaConnectionCommand),
    vscode.commands.registerCommand('orion.diagnoseAi', diagnoseAiCommand),
    vscode.commands.registerCommand('orion.configureAi', configureAiCommand),
    vscode.commands.registerCommand('orion.selectOllamaModel', selectOllamaModelCommand)
  );
}

export async function openFirstUseGuideCommand(): Promise<string> {
  const guide = buildFirstUseGuide();
  const doc = await vscode.workspace.openTextDocument({ content: guide, language: 'markdown' });
  await vscode.window.showTextDocument(doc, { preview: false });
  logOrion('info', 'first use guide opened');
  return guide;
}

export async function diagnoseAiCommand(): Promise<string> {
  logOrion('info', 'ai diagnostics started');
  const mode = vscode.workspace.getConfiguration('orion.ai').get<string>('mode', 'auto');
  const baseUrl = vscode.workspace.getConfiguration('orion.ollama').get<string>('baseUrl', 'http://localhost:11434');
  const configuredModel = vscode.workspace.getConfiguration('orion.ollama').get<string>('model', 'qwen2.5-coder:3b');
  if (mode !== 'ollama') {
    const report = buildAiDiagnosticsReport({
      mode,
      baseUrl,
      configuredModel,
      resolvedModel: configuredModel,
      tagsOk: false,
      models: [],
      completionOk: false,
      completionMessage: `Teste Ollama nao executado para modo ${mode}.`
    });
    const doc = await vscode.workspace.openTextDocument({ content: report, language: 'markdown' });
    await vscode.window.showTextDocument(doc, { preview: false });
    return report;
  }

  const tags = await probeOllamaConnection(baseUrl);
  const resolvedModel = chooseOllamaModel(configuredModel, tags.models);
  logOrion('info', 'ollama tags probe finished', { ok: tags.ok, modelCount: tags.models.length, baseUrl });
  let completionOk = false;
  let completionMessage = 'Teste nao executado porque /api/tags falhou.';

  if (tags.ok && tags.models.length > 0) {
    const answer = await generateOllamaResponse(baseUrl, resolvedModel, 'Responda apenas OK.', 'Diagnostico ORION IA.');
    completionOk = /\bok\b/i.test(answer);
    completionMessage = completionOk ? 'OK' : `Resposta inesperada: ${answer.slice(0, 180)}`;
    logOrion(completionOk ? 'info' : 'warn', 'ollama completion diagnostic finished', { ok: completionOk, model: resolvedModel });
  }

  const report = buildAiDiagnosticsReport({
    mode,
    baseUrl,
    configuredModel,
    resolvedModel,
    tagsOk: tags.ok,
    models: tags.models,
    completionOk,
    completionMessage
  });
  const doc = await vscode.workspace.openTextDocument({ content: report, language: 'markdown' });
  await vscode.window.showTextDocument(doc, { preview: false });
  return report;
}

export async function setupWorkspaceCommand(): Promise<string> {
  const written = await writeGeneratedFiles(buildWorkspaceSetupFiles(getDefaultDataBase()), getOverwriteSetting());
  const message = summarizeFiles('Workspace ORION configurado', written);
  vscode.window.showInformationMessage(message);
  return message;
}

export async function reviewCurrentFileCommand(): Promise<string> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    throw new Error('Nenhum arquivo aberto para revisao.');
  }

  const fileName = editor.document.fileName;
  if (!isSupportedForReview(fileName)) {
    throw new Error('Tipo de arquivo ainda nao suportado pela revisao ORION.');
  }

  const markdown = formatReview(reviewText(fileName, editor.document.getText()));
  const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
  await vscode.window.showTextDocument(doc, { preview: false });
  return markdown;
}

export async function createDatabricksPipelineCommand(name?: string): Promise<string> {
  const value = name ?? await askName('Nome do pipeline Databricks');
  const written = await writeGeneratedFiles(buildDatabricksPipelineFiles(value, getDefaultDataBase()), getOverwriteSetting());
  const message = summarizeFiles('Pipeline Databricks ORION criado', written);
  vscode.window.showInformationMessage(message);
  return message;
}

export async function generateCopilotInstructionsCommand(): Promise<string> {
  const written = await writeGeneratedFiles([{ relativePath: '.github/copilot-instructions.md', content: buildCopilotInstructions() }], getOverwriteSetting());
  const message = summarizeFiles('Copilot instructions geradas', written);
  vscode.window.showInformationMessage(message);
  return message;
}

export async function generateTechnicalDocumentationCommand(): Promise<string> {
  const written = await writeGeneratedFiles(buildTechnicalDocumentation(workspaceDisplayName()), getOverwriteSetting());
  const message = summarizeFiles('Documentacao tecnica ORION criada', written);
  vscode.window.showInformationMessage(message);
  return message;
}

export async function createDotnetApiCommand(name?: string): Promise<string> {
  const value = name ?? await askName('Nome da API .NET 8');
  const written = await writeGeneratedFiles(buildDotnetApiFiles(value), getOverwriteSetting());
  const message = summarizeFiles('API .NET 8 ORION criada', written);
  vscode.window.showInformationMessage(message);
  return message;
}

export async function createBlazorPageCommand(name?: string): Promise<string> {
  const value = name ?? await askName('Nome da pagina Blazor');
  const written = await writeGeneratedFiles(buildBlazorFiles(value), getOverwriteSetting());
  const message = summarizeFiles('Pagina Blazor ORION criada', written);
  vscode.window.showInformationMessage(message);
  return message;
}

export async function testOllamaConnectionCommand(): Promise<string> {
  const baseUrl = vscode.workspace.getConfiguration('orion.ollama').get<string>('baseUrl', 'http://localhost:11434');
  const model = vscode.workspace.getConfiguration('orion.ollama').get<string>('model', 'qwen2.5-coder:3b');
  const result = await probeOllamaConnection(baseUrl);
  const hasModel = result.models.includes(model);
  const resolvedModel = chooseOllamaModel(model, result.models);
  const message = result.ok
    ? `Ollama conectado. Modelo configurado: ${model}. ${hasModel ? 'Modelo encontrado.' : `Modelo nao listado; a ORION usara ${resolvedModel}.`}`
    : 'Nao foi possivel conectar ao Ollama local.';
  logOrion(result.ok ? 'info' : 'warn', 'ollama connection test', { ok: result.ok, baseUrl, configuredModel: model, resolvedModel });
  vscode.window.showInformationMessage(message);
  return message;
}

export async function selectOllamaModelCommand(): Promise<string> {
  return await configureOllamaCommand();
}

export async function configureAiCommand(): Promise<string> {
  const currentMode = vscode.workspace.getConfiguration('orion.ai').get<string>('mode', 'auto');
  const selected = await vscode.window.showQuickPick([
    { label: 'Ollama local', mode: 'ollama', description: currentMode === 'ollama' ? 'atual' : 'chat local com modelos instalados' },
    { label: 'Auto', mode: 'auto', description: currentMode === 'auto' ? 'atual' : 'tenta Ollama em conversa livre' },
    { label: 'Local', mode: 'local', description: currentMode === 'local' ? 'atual' : 'heuristicas sem modelo' },
    { label: 'Copilot', mode: 'copilot', description: currentMode === 'copilot' ? 'atual' : 'Language Model API do VS Code quando disponivel' }
  ], {
    title: 'Configurar IA da ORION',
    placeHolder: 'Escolha como a ORION deve responder'
  });

  if (!selected) {
    return 'Configuracao de IA cancelada.';
  }

  if (selected.mode === 'ollama') {
    return await configureOllamaCommand();
  }

  await updateOrionConfiguration('orion.ai', 'mode', selected.mode);
  const message = `ORION configurada em modo ${selected.mode}.`;
  vscode.window.showInformationMessage(message);
  return message;
}

async function configureOllamaCommand(): Promise<string> {
  const ollamaConfig = vscode.workspace.getConfiguration('orion.ollama');
  const configuredBaseUrl = ollamaConfig.get<string>('baseUrl', 'http://localhost:11434');
  const currentModel = ollamaConfig.get<string>('model', 'qwen2.5-coder:3b');
  const baseUrl = await vscode.window.showInputBox({
    title: 'URL do Ollama',
    prompt: 'A ORION vai consultar /api/tags nesta URL.',
    value: configuredBaseUrl,
    placeHolder: 'http://localhost:11434'
  });

  if (!baseUrl?.trim()) {
    return 'Configuracao do Ollama cancelada.';
  }

  const result = await probeOllamaConnection(baseUrl);
  logOrion(result.ok ? 'info' : 'warn', 'ollama model selection probe', { ok: result.ok, baseUrl, modelCount: result.models.length });
  if (!result.ok) {
    const message = `Nao foi possivel consultar modelos em ${baseUrl}/api/tags.`;
    vscode.window.showWarningMessage(message);
    return message;
  }

  if (result.models.length === 0) {
    const message = `Ollama respondeu em ${baseUrl}/api/tags, mas nao retornou modelos instalados.`;
    vscode.window.showWarningMessage(message);
    return message;
  }

  const selected = await vscode.window.showQuickPick(buildOllamaModelQuickPickItems(currentModel, result.modelInfos), {
    title: 'Selecionar modelo Ollama para ORION',
    placeHolder: 'Pesquise por nome, familia, tamanho ou versao retornada por /api/tags',
    matchOnDescription: true,
    matchOnDetail: true
  });

  if (!selected) {
    return 'Selecao de modelo Ollama cancelada.';
  }

  await updateOrionConfiguration('orion.ai', 'mode', 'ollama');
  await updateOrionConfiguration('orion.ollama', 'model', selected.label);
  await updateOrionConfiguration('orion.ollama', 'baseUrl', baseUrl);
  const testAnswer = await generateOllamaResponse(baseUrl, selected.label, 'Responda apenas OK.', 'Teste de configuracao ORION.');
  const tested = /\bok\b/i.test(testAnswer);
  const message = tested
    ? `ORION configurada para Ollama com modelo ${selected.label}. Teste do modelo OK.`
    : `ORION configurada para Ollama com modelo ${selected.label}. O modelo foi salvo, mas o teste nao retornou OK.`;
  vscode.window.showInformationMessage(message);
  return message;
}

async function askName(prompt: string): Promise<string> {
  const value = await vscode.window.showInputBox({ prompt, placeHolder: 'exemplo: risco credito' });
  if (!value?.trim()) {
    throw new Error('Operacao cancelada: informe um nome valido.');
  }
  return value.trim();
}

function summarizeFiles(prefix: string, files: readonly string[]): string {
  if (files.length === 0) {
    return `${prefix}: nenhum arquivo alterado porque todos ja existiam.`;
  }
  return `${prefix}: ${files.length} arquivo(s) gravado(s).`;
}

async function updateOrionConfiguration(section: string, key: string, value: string): Promise<void> {
  const resource = getConfigurationResource();
  const config = vscode.workspace.getConfiguration(section, resource);
  const target = toConfigurationTarget(resolveConfigurationUpdateScope(config.inspect(key)));
  await config.update(key, value, target);
  logOrion('info', 'configuration updated', { key: `${section}.${key}`, target: String(target) });
}

function getConfigurationResource(): vscode.Uri | undefined {
  return vscode.window.activeTextEditor?.document.uri ?? vscode.workspace.workspaceFolders?.[0]?.uri;
}

function toConfigurationTarget(scope: OrionConfigurationUpdateScope): vscode.ConfigurationTarget {
  switch (scope) {
    case 'workspaceFolder':
      return vscode.ConfigurationTarget.WorkspaceFolder;
    case 'workspace':
      return vscode.ConfigurationTarget.Workspace;
    default:
      return vscode.ConfigurationTarget.Global;
  }
}
